# Ontology Storm

An experiment in grounding GPT with collaboratively curated Knowledge Graphs.

## Why do I need a Knowledge Graph?

*Everyone* needs a Knowledge Graph :). Or perhaps you need a Domain Model, or systems architecture, or Organizational Chart. Almost any shared understanding can be expressed as a Knowledge Graph. At the end of the day, it's all *boxes and lines*.

The proliferation of Large Language Models (LLMs) has made formal symbolic representations all the more relevant because LLMs have greatly advanced our ability to process and generate natural language text but they are (poor at reasoning)[https://lastweekin.ai/p/the-inherent-limitations-of-gpt-3] and producing [reliable information](https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)).

## Sounds kinda dry...

Well that's been part of the problem. It has historically taken a lot of tedius work to construct and maintain these formal structures. We aim to make it fast, collaborative, and fun.

## Prior work
* The biggest research effort thus far extracting Knowledge Graphs from GPT output appears to be [OntoGPT](https://github.com/monarch-initiative/ontogpt) ( [paper](https://arxiv.org/pdf/2304.02711.pdf))
  * Also worth a look are [GraphGPT](https://github.com/varunshenoy/GraphGPT) and [trainmyai](https://github.com/gidgreen/trainmyai)
* TerminusDB - open source knowledge graph and document store with Git-like version control
* [El Dorado](https://www.infoq.com/news/2017/09/el-dorado-released) ([DDD Keynote](https://www.youtube.com/watch?v=oPJIXPC_vn8))
* [Holmes Extractor](https://github.com/msg-systems/holmes-extractor) - Using NLP (but not LLMs) to extract predicate logic statements from free text.
## Get started

1. Clone this repo

2. Install dependencies, including the Supabase CLI

```bash
yarn
```

3. Create frontend env file

```bash
cp .env.example .env
```

4. Create supabase functions env file

```bash
echo "OPENAI_API_KEY=sk-xxx" > supabase/.env
```

5. Start the supabase project

```bash
npm run supabase:start
```

6. Start the supabase functions locally

```bash
npm run supabase:dev
```

7. Start the frontend locally

```bash
npm run dev 
```

8. Open [http://localhost:3100](http://localhost:3100) with your browser to see the result.

## Deploy

1. Create a new project on [Supabase](https://supabase.io)

2. Create a new project on [Vercel](https://vercel.com)

3. To deploy the frontend, connect your Vercel project to your GitHub repo and push to main.

4. To deploy the supabase functions, first login to Supabase:

```bash
supabase login
```

Then, link your project:

```bash
supabase link --project-ref <project-ref>
```

Then, deploy the functions:

```bash
npm run supabase:deploy
```

Optionally, if you're also using the Supabase Vector Store from LangChain, you'll need to push the schema to the database:

```bash
supabase db push
```
