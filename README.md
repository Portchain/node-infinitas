
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
It exposes a node.js API as well as a HTTP API and therefore can be integrated
with virtually any application that can call and expose HTTP JSON services.

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
- resilient: it is a distributed scheduler, supporting losing the master node

# The basics

There are 2 ways that you can deploy Infinitas. It can be embedded within your
node.js instances or it can be deployed as a standalone cluster of node.js
instances.

Infinitas works as a cluster of nodes. See RAFT specs.

# Quick start

```
    const Infinital = require('infinitas')
    
    var infinitas = new Infinitas()

    var task = {
      name: 'myTaskName',
      schedules: [{
        type: 'cron',
        data: '* * * * *'
      }, {
        type: 'interval',
        data: 60 * 60 * 1000 // every hour
      }]
    }

    infinitas.schedule(task, function(err, scheduleId) {
      // jobs for that task will be created every minute and every hour
    })

    // and there are several ways of removing a schedule
    infinitas.unschedule('myTaskName', scheduleId, function(err, scheduleId) {})
    infinitas.unschedule('myTaskName', '* * * * *', function(err, scheduleId) {})

    // Here is how you declare your business logic
    infinitas.processor('myTaskName', function(job) {
      // task business logic here...

      // signal the progress if it is a long running job that you want to monitor
      job.progress(0.10) // with either a percentage
      job.progress('step1') // or steps
      job.progress(0.30, 'step2') // or both

      // when the task is finished, call this.done()
      job.done()
      // or if it failed, you can call this.fail(err) with an error object
      job.fail(new Error('The task failed to run'))
      job.fail('The task failed to run') // the error can also be a simple string
      job.fail({
        reason: 'database connection down'   // or an object with much more details
        details: {
          dbHost: 'serv1.domain.com',
          dbPort: 28017
        }
      })


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
| minInterval   |        | integer | defines a minimum interval for this task in milliseconds. null by default. If set, the scheduler will make sure that this task does not run more than every <minInterval> milliseconds. |
| lastRun *     |        | Object  | an object representing the last triggered job                                                                                                                                           |
|               | id     | string  | the unique identifier of the last triggered job                                                                                                                                         |
|               | date   | Date    | represents the date of the last triggered job                                                                                                                                           |
|               | status | string  | one of "succeeded", "failed", "running"                                                                                                                                                 |
| lastFailure * |        | Object  | an object representing the last failed job. Attributes same as above                                                                                                                    |
| lastSuccess * |        | Object  | an object representing the last successful job. Attributes same as above                                                                                                                |
| schedule      |        | Object  | A schedule                                                                                                                                                                              |
|               | type   | string  | The type of schedule. Can be one of "interval", "cron"                                                                                                                                  |
|               | data   | int     | The number of milliseconds between each job                                                                                                                                             |

Properties with a ```*``` are read only.


## Schedule

## Processor

