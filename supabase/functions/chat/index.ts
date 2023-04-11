import { serve } from "http/server.ts";
import { ChatOpenAI } from "langchain/chat_models";
import { LLMChain } from "langchain/chains";
import { CallbackManager } from "langchain/callbacks";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from "langchain/prompts";

import { corsHeaders } from "../_shared/cors.ts";

const prompt = ChatPromptTemplate.fromPromptMessages([
  HumanMessagePromptTemplate.fromTemplate(`
We are making an Ontology with semantic triples. This will represent a software architecture. 
Read the text and respond with triples relating to these types of information:

The main entity class we care about is Component.
The main relations we are representing are:

ComponentId isA Component
ComponentId calls ComponentId
ComponentId partOf ComponentId

Example conversation:

TEXT:

The main components of a Kubernetes cluster include:
Nodes: Nodes are VMs or physical servers that host containerized applications. Each node in a cluster can run one or more application instance. There can be as few as one node, however, a typical Kubernetes cluster will have several nodes (and deployments with hundreds or more nodes are not uncommon).
Image Registry: Container images are kept in the registry and transferred to nodes by the control plane for execution in container pods.
Pods: Pods are where containerized applications run. They can include one or more containers and are the smallest unit of deployment for applications in a Kubernetes cluster.

TRIPLES:

(Node isA Component)
(ImageRegistry isA Component)
(Pod isA Component)
(Pod partOf Node)
(Container partOf Pod)
(ContainerImage partOf ImageRegistry)
(Node calls ImageRegistry)
(Node partOf KubernetesCluster)
(ImageRegistry partOf KubernetesCluster)
(Pod partOf KubernetesCluster)

Current conversation:

TEXT:

{input}

TRIPLES:
  `),
]);

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { input } = await req.json();
    // Check if the request is for a streaming response.
    const streaming = req.headers.get("accept") === "text/event-stream";
    const modelName = "gpt-3.5-turbo";
    if (streaming) {
      // For a streaming response we need to use a TransformStream to
      // convert the LLM's callback-based API into a stream-based API.
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();

      const llm = new ChatOpenAI({
        modelName,
        streaming,
        callbackManager: CallbackManager.fromHandlers({
          handleLLMNewToken: async (token) => {
            await writer.ready;
            await writer.write(encoder.encode(`data: ${token}\n\n`));
          },
          handleLLMEnd: async () => {
            await writer.ready;
            await writer.close();
          },
          handleLLMError: async (e) => {
            await writer.ready;
            await writer.abort(e);
          },
        }),
      });
      const chain = new LLMChain({ prompt, llm });
      // We don't need to await the result of the chain.run() call because
      // the LLM will invoke the callbackManager's handleLLMEnd() method
      chain.call({ input }).catch((e) => console.error(e));

      return new Response(stream.readable, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } else {
      // For a non-streaming response we can just await the result of the
      // chain.run() call and return it.
      const llm = new ChatOpenAI({modelName});
      const chain = new LLMChain({ prompt, llm });
      const response = await chain.call({ input });

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
