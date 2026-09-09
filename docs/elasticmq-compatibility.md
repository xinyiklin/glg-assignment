# ElasticMQ compatibility

## Setup issue and chosen fix

ElasticMQ is pinned to `softwaremill/elasticmq:1.6.16`, verified with the provided
`elasticmq.conf` to initialize all four queues and serve the legacy dashboard on
port 9325. The original unpinned image resolved to 1.7.1, whose entrypoint did not
apply this Compose file's config argument; queues were absent and port 9325 was
unavailable. The pin preserves the expected local environment without changing
application logic. See the [upstream releases](https://github.com/softwaremill/elasticmq/releases).

## Alternative considered

Adapt Compose to a newer ElasticMQ image by mounting
`elasticmq.conf` at the image's default config path and removing the custom
`command`. Pinning `1.6.16` was the smallest verified change that preserved the
existing Compose/config structure, queue initialization, and legacy dashboard
across fresh setups.

The pin is defined in [`docker-compose.yml`](../docker-compose.yml). See the
[README setup instructions](../README.md#setup) to run the local environment.
