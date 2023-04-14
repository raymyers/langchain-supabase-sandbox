import Head from "next/head";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { Session, useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  FormEvent,
  FormEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  AppShell,
  Avatar,
  Badge,
  Button,
  Code,
  Container,
  Drawer,
  Flex,
  Group,
  Header,
  Popover,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { TransferList, TransferListData } from "@mantine/core";
import dagre from "dagre";
import "reactflow/dist/style.css";

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Edge,
  Connection,
  Node,
  Position,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
} from "reactflow";
import parser from "../lib/parser";
import miniOntology, { MiniOntology, Triple } from "../lib/mini-ontology";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { elkLayout } from "../lib/layout";
import { ElkExtendedEdge, ElkLabel, ElkNode } from "elkjs";


const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172;
const nodeHeight = 36;

// const getLayoutedElements = (
//   nodes: Node[],
//   edges: Edge[],
//   direction = "TB"
// ) => {
//   const isHorizontal = direction === "LR";
//   dagreGraph.setGraph({ rankdir: direction });

//   nodes.forEach((node: Node) => {
//     dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
//   });

//   edges.forEach((edge: Edge) => {
//     dagreGraph.setEdge(edge.source, edge.target);
//   });

//   dagre.layout(dagreGraph);

//   nodes.forEach((node: Node) => {
//     const nodeWithPosition = dagreGraph.node(node.id);
//     node.targetPosition = (isHorizontal ? "left" : "top") as Position;
//     node.sourcePosition = (isHorizontal ? "right" : "bottom") as Position;

//     // We are shifting the dagre node position (anchor=center center) to the top left
//     // so it matches the React Flow node anchor point (top left).
//     node.position = {
//       x: nodeWithPosition.x - nodeWidth / 2,
//       y: nodeWithPosition.y - nodeHeight / 2,
//     };

//     return node;
//   });

//   return { nodes, edges };
// };

interface GraphParams {
  triples: Triple[];
}


const initialNodes = [
  { id: "1", data: { label: "-" }, position: { x: 100, y: 100 } },
  { id: "2", data: { label: "Node 2" }, position: { x: 100, y: 200 } },
];

const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];
const GraphThingy = ({ triples }: GraphParams) : JSX.Element => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useReactFlow();
  const nodesInitialized = useNodesInitialized({});
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );
  useEffect(() => {
    console.log("Change to triples");
    const nodeNames = new Set<string>();
    const nameToNode = new Map<string, ElkNode>();
    for (let triple of triples) {
      nodeNames.add(triple[0]);
      nodeNames.add(triple[2]);
    }
    let x = 0;
    const xStep = 100;
    const newNodes = [...nodeNames].map((name) => {
      const node: ElkNode = {
        id: name,
        labels: [{text: name}]
      };
      nameToNode.set(name, node);
      x += xStep;
      return node;
    });
    const nameToEdge = new Map<string, ElkExtendedEdge>();
    const newEdges: ElkExtendedEdge[] = [];
    triples.forEach((triple) => {
      const source = triple[0];
      const target = triple[2];
      const relation = triple[1];
      let eName = `${source}->${target}`;
      const eNameReversed = `${target}->${source}`;
      
      const edge: ElkExtendedEdge = {
        id: eName,
        sources: [source],
        targets: [target],
        labels: [{text: relation}],
      };
      const existingEdge = nameToEdge.get(eName);
      const existingReverseEdge = nameToEdge.get(eNameReversed);
      if (existingEdge) {
        if (existingEdge.labels && existingEdge.labels[0].text) {
          existingEdge.labels[0].text = existingEdge.labels[0].text + ", " + relation;
        }
      } else if (existingReverseEdge) {
        // TODO
        // existingReverseEdge.markerStart = {
        //   type: MarkerType.ArrowClosed,
        // };
        if (existingReverseEdge.labels && existingReverseEdge.labels[0].text) {
          existingReverseEdge.labels[0].text = existingReverseEdge.labels[0].text + ", " + relation;
        }
      } else {
        newEdges.push(edge);
        nameToEdge.set(eName, edge);
      }
    });
    console.log("Updating graph", newNodes, newEdges);
    const labelsToText = (labels : ElkLabel[] | undefined) => {
      return labels ? (labels[0].text || "") : ""
    }
    const nodesForFlow = (graph : ElkNode) : Node[] => {
      return (graph.children || []).map((node: ElkNode) : Node => {
          
        const position = { x: node.x || 0, y: node.y || 0}
        return {
          id: node.id,
          data: {label: labelsToText(node.labels)},
          position,
        };
      })
    };
    const edgesForFlow = (graph : ElkNode) : Edge[] => {
      return (graph.edges || []).map( (edge : ElkExtendedEdge) : Edge => {
        return {
          id: edge.id,
          source: edge.sources[0],
          target: edge.targets[0],
          label: labelsToText(edge.labels)
        }
      });
    };
    elkLayout(newNodes, newEdges).then((graph) => {
      setNodes(nodesForFlow(graph));
      setEdges(edgesForFlow(graph));
    });
    
    
  }, [triples]);
  useEffect(() => {
    if (nodesInitialized) {
      if (reactFlowInstance) {
        reactFlowInstance.fitView();
      }
    }
  }, [nodesInitialized]);
  return (
    <div className="layoutflow" style={{border: '2px solid rgba(0, 0, 0, 0.1)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />

        <Background color="#aaa" gap={16}/>
        {/* <Panel position="top-right">top-right</Panel> */}
      </ReactFlow>
    </div>
  );
};

interface FormParams {
  onSubmit: FormEventHandler<HTMLFormElement>;
  input: string;
  setInput: (a: string) => void;
  stream: boolean;
  setStream: (a: (b: boolean) => boolean) => void;
  onReset: () => void;
}

const FormThingy = ({
  onSubmit,
  input,
  setInput,
  // stream,
  // setStream,
  onReset,
}: FormParams) => {
  return (
    <form
      onSubmit={onSubmit}
      // style={{ display: "flex", flexDirection: "column" }}
    >
      <div>
        <Stack align="stretch" justify="flex-start">
          <Textarea
            placeholder="Ask..."
            autosize
            onChange={(e) => setInput(e.target.value)}
            minRows={3}
            maxRows={7}
          />
          <Group>
            <Button variant="default" color="teal" type="submit">
              Go
            </Button>
            <Button variant="subtle" color="red" onClick={onReset}>
              Reset
            </Button>
          </Group>
        </Stack>
        {/* <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            id="stream"
            style={{ marginRight: 5 }}
            checked={stream}
            onChange={() => setStream((s) => !s)}
          />

          <label htmlFor="stream">Stream</label>
        </div> */}
      </div>
    </form>
  );
};

export default function Home() {
  const supabase = useSupabaseClient();
  const [stream, setStream] = useState(true);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [session, setSession] = useState<Session | null>(null)
  
  const [acceptedTriples, setAcceptedTriples] = useState<Triple[]>([]);
  const [transferListData, setTransferListData] = useState<TransferListData>([
    [],
    [],
  ]);
  const [showReviewer, setShowReviewer] = useState(false);

  const [inflight, setInflight] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // Prevent multiple requests at once
      if (inflight) return;

      // Reset output
      setInflight(true);
      setOutput("");

      try {
        if (stream) {
          // If streaming, we need to use fetchEventSource directly
          await fetchEventSource(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat`,
            {
              method: "POST",
              body: JSON.stringify({ input }),
              headers: { "Content-Type": "application/json" },
              onmessage(ev) {
                setOutput((o) => o + ev.data);
              },
            }
          );
          setInput("");
        } else {
          // If not streaming, we can use the supabase client
          const { data } = await supabase.functions.invoke("chat", {
            body: { input },
          });
          setOutput(data);
          setInput("");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setInflight(false);
      }
    },
    [input, stream, inflight, supabase]
  );
  useEffect(() => {
    const tripleToKey = (triple: Triple) => triple.join("||");
    function arrayEquals(a: any[], b: any[]) {
      return (
        Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
      );
    }
    console.log(inflight, "- Has changed");
    if (!inflight) {
      try {
        // Will at some point maintain the ontology, now just building it every time.
        const ontology: MiniOntology = {
          entities: [],
          entityClasses: ["Component"],
          relations: ["isA", "calls", "partOf"],
          triples: acceptedTriples,
        };
        ontology.entities = miniOntology.extractEntities(acceptedTriples);
        const parsedTriples = parser.parseTriplesFromSexpr(output);
        miniOntology.normalizeTriples(parsedTriples, ontology);
        console.log("normalizedTriples", parsedTriples);
        const nonTrivialTriples = parsedTriples.filter(
          ([_, rel, target]) => !(rel === "isA" && target === "Component")
        );
        console.log("nonTrivialTriples", nonTrivialTriples);
        const acceptedList = transferListData[1];
        const triplesNotAlreadyAccepted = nonTrivialTriples.filter(
          (triple) => !acceptedTriples.some((acc) => arrayEquals(triple, acc))
        );
        const tentativeList = triplesNotAlreadyAccepted.map((triple) => {
          return { value: tripleToKey(triple), label: triple.join(" ") };
        });
        setTransferListData([tentativeList, acceptedList]);
        setShowReviewer(true);
      } catch (e) {
        console.log(e);
      }
    }
  }, [inflight]);

  const onTransferListChange = (newData: TransferListData) => {
    setTransferListData(newData);
    const triples = newData[1].map((elt) => elt.value.split("||") as Triple);
    const validTriples = triples.filter((triple) => triple.length === 3);
    const invalidTriples = triples.filter((triple) => triple.length !== 3);
    setAcceptedTriples(validTriples);
    if (invalidTriples.length > 0) {
      console.error("invalidTriples", invalidTriples);
    }
  };
  const supabaseClient = useSupabaseClient()
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <AppShell
          padding="md"
          // navbar={
          //   <Navbar width={{ base: 300 }} height={500} p="xs">
          //     Navbar content
          //   </Navbar>
          // }

          header={
            <Header height={60} p="xs" style={{display: 'inline-block'}}>
              <SimpleGrid cols={2}>
                <div>
                  <Title style={{fontFamily: 'Luminari, fantasy'}}>Ontology Storm</Title>
                </div>
              
                <Flex
                  mih={50}
                  gap="md"
                  justify="flex-end"
                  align="flex-start"
                  direction="row"
                  wrap="wrap"
                >
                  <Popover width={200} position="bottom" withArrow shadow="md">
                    <Popover.Target>
                      <Avatar radius="xl" src={session?.user.user_metadata.avatar_url}/>
                    </Popover.Target>
                    <Popover.Dropdown>
                      { !session && <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['github']} onlyThirdPartyProviders /> }
                      { session && <div><Button variant="light" onClick={() => supabaseClient.auth.signOut()}>Sign out</Button></div>}
                    </Popover.Dropdown>
                  </Popover>
                
                
                </Flex>
              
              </SimpleGrid>
              
            </Header>
          }
        >
          <Stack>
            <SimpleGrid cols={2}>
              <Stack spacing="xs">
                <Text>Input</Text>
                <FormThingy
                  onSubmit={onSubmit}
                  stream={stream}
                  setStream={setStream}
                  input={input}
                  setInput={setInput}
                  onReset={() => {
                    setAcceptedTriples([])
                    setTransferListData([[], []])
                    setOutput("")
                  }}
                ></FormThingy>
              </Stack>
              <Group position="apart" mb="xs">
                {inflight && (
                  <Badge color="pink" variant="light">
                    Loading
                  </Badge>
                )}
                {output && <Group spacing="xs">
                  <Text>Response</Text>
                  <Code fz="xs">{output}</Code>
                </Group>}
                <Flex justify="flex-end" align="flex-start" direction="row" w="100%" p={10}>
                  <Button
                    variant="subtle"
                    color="blue"
                    onClick={() => setShowReviewer(true)}
                  >
                    Review Triples &rarr;
                  </Button>
                </Flex>
              </Group>
            </SimpleGrid>
            <Container h={400} w={"100%"} style={{ margin: 0, padding: 0}}>
              <ReactFlowProvider>
                <GraphThingy triples={acceptedTriples}></GraphThingy>
              </ReactFlowProvider>
            </Container>
          </Stack>
          <Drawer
            position="right"
            opened={showReviewer}
            onClose={() => setShowReviewer(false)}
            title="Review"
            // overlayProps={{ opacity: 0.5, blur: 4 }}
          >
            <TransferList
              value={transferListData}
              onChange={onTransferListChange}
              searchPlaceholder="Search..."
              nothingFound="Nothing here"
              titles={["Tentative", "Accepted"]}
              showTransferAll={false}
              breakpoint="sm"
            />
          </Drawer>
        </AppShell>
      </main>
    </>
  );
}
