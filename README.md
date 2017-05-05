
### Infinitas

A scheduler with persistence. Useable through both a node.js and a HTTP API.

**Note**: Infinitas is in active development. This Readme currently describes
what version 1.0.0 of Infinitas will provide.

#### What is working so far ?

- In memory scheduling with 'cron' and 'interval' functionality.
- No PostgreSQL support
- Infinitas runs with only a single master node. It is not distributed and
resilient yet

# Overview

Infinitas is a node.js based scheduling engine. Think of it as an application
level 'cron' scheduler.
It exposes a node.js client library as well as a websocket API and therefore can
be integrated with virtually any application supporting websockets.

# What can Infinitas do for you ?

If your application has tasks that need to occur at specific moments in time or
if you need regular maintenance jobs to be triggered, Infinitas is for you.

A few examples of what Infinitas can do:

- Perform database archival at regular interval (eg. at midnight or every 12
hours)
- Crawl your database once a week for records that can be archived and publish
these in an other, less dynamic storage
- Provide calendar reminders for your application (eg. send an email 1 day
before a task is due)

Infinitas features include:

- persistence: it makes your jobs resilient (out of the box with postgres)
- monitoring/audit: it comes with a user interface for your jobs statuses and
can notify you of failures
- scalable: run several instances to handle real production load

# The basics

There are 2 ways that you can deploy Infinitas. It can be embedded within your
node.js instances or it can be deployed as a standalone server with multiple
clients.


# Quick start

```
    const Infinitas = require('infinitas')
    
    var infinitas = new Infinitas()

    var task = {
      name: 'myTaskName',
      schedule: '*/15 * * * *',
      timeout: 60000 // timeout in milliseconds
    }

    infinitas.schedule(task, function(err) {
      // jobs for that task will be created every minute and every hour
    })

    // unschedule a task
    infinitas.unschedule('myTaskName', function(err) {})

    // Here is how you declare your business logic
    infinitas.addProcessor('myTaskName', function(job) {
      // task business logic here...

      job.on('timeout', (taskTimeoutValue) => {
        // The job timed-out
        // Note that because this event, job.done() and job.fail() are all
        //   asynchronous there is no guarantee that the timeout event will fire
        //   before you call job.done() or job.fail().
        // Regardless of a job timeout status, job.log() will continue to log
        //   your messages.
      })

      // optionally, you can signal the progress of a job
      job.progress(0.10) // with either a float between 0 and 1 respectively 0% and 100%
      job.progress('step1') // or steps
      job.progress(0.30, 'step2') // or both

      // log information related to the job
      // An optional callback will catch transmission errors to the server.
      // If no callback is used, errors are ignored
      job.log('A Fox once saw a Crow...')

      // when the task is finished, call this.done()
      job.done((err) => {
        // err is non null when:
        //   - infinitas server cannot be contacted (err.code = 'server_unreachable')
        //   - the job has already timed out (err.code = 'job_timed_out')
        //   - job.done() was already called (err.code = 'job_done')
        //   - job.fail() was previously called (err.code = 'job_failed')
      })
      
      // or if it failed, you can call this.fail()
      job.fail((err) => {
        // err is non null when:
        //   - infinitas server cannot be contacted (err.code = 'server_unreachable')
        //   - the job has already timed out (err.code = 'job_timed_out')
        //   - job.fail() was already called (err.code = 'job_failed')
        //   - job.done() was previously called (err.code = 'job_done')
      })


      // Note that you cannot log messages after calling either job.done() or
      //   job.fail()
      job.log('A Fox once saw a Crow...') // this will throw an error

    })
```

# Objects

As an Infinitas consumer, you will be defining ```Tasks``` and ```Processors```.
At a specific time or interval, a ```Task``` is sent as a ```Job``` to a
```Processor```.

## Tasks

A task has the following properties:

| Property      | -sub   | Type    | Description                                                                                                                                                                             |
|---------------|--------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| name          |        | string  | each task is uniquely identifiable through a name within the system                                                                                                                     |
| lastJob *     |        | Object  | an object representing the last triggered job                                                                                                                                           |
|               | id     | string  | the unique identifier of the last triggered job                                                                                                                                         |
|               | date   | Date    | represents the date of the last triggered job                                                                                                                                           |
|               | status | string  | one of "succeeded", "failed", "running"                                                                                                                                                 |
| lastFailure * |        | Object  | an object representing the last failed job. Attributes same as above                                                                                                                    |
| lastSuccess * |        | Object  | an object representing the last successful job. Attributes same as above                                                                                                                |
| schedule      |        | string  | CRON-like schedule                                                                                                                                                                      |

Properties with a ```*``` are read only.


## Schedule

## Processor

# Multiple clients

The above quick start runs a single client and a single Infinitas server in the
local process. If you want multiple clients to concurrently run tasks, Infinitas
can be used by multiple clients.

In that configuration, each client opens a websocket connection to the server.
Job allocation to clients is round-robin.

On each client:
```
  const Infinitas = require('infinitas')
    
  var infinitas = new Infinitas({
    server: 'wss://my-infinitas-server:3000'
  })

  infinitas.processor('myTaskName', function(job) {
    // do smthg
    job.done()
  })
```

If no processor is active, the server will retry after 1, 10 and 30 seconds.

To start the server, download infinitas and run npm start. Our goal is to
provide a deb package but that work is still in progress.

# Database

Infinitas creates and maintain its own tables. Migrations are run when the
server is started. All tables are prefixed with `infinitas_` to prevent
conflicting with other database users.