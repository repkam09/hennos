# Hennos: Langchain Edition

Note: This is not at all complete yet. The current version of this bot can be found at: https://github.com/repkam09/telegram-gpt-bot

To install dependencies:

```bash
npm install
```

We use Redis for saving chat context and embedded documents

```bash
docker run -d --name redis-stack-server -p 6379:6379 redis/redis-stack-server:latest
```

We use Temporal workflows for processing documents and chat completions

Install the temporal cli: <https://docs.temporal.io/cli>

```bash
temporal server start-dev
```

See the local temporal dashboard at: <http://localhost:8235/namespaces/default/workflows>

To run both Redis and Temporal you can use

```bash
npm run deps
```
