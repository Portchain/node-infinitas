
**Note**: Sonic is in active development. This Readme currently describes what version 1.0.0 of Sonic
will provide.

# Overview

Sonic is a node.js based scheduling engine. Think of it as an application level 'cron' scheduler.
It exposes a node.js API as well as a HTTP API and therefore can be integrated with virtually any
application that can call and expose HTTP JSON services.

It can scale to thousands of scheduled jobs with no sweat.

# What can Sonic do for you ?

If your application has tasks that need to occur at specific moments in time or if you need
regular maintenance jobs to be triggered, Sonic is for you.

A few examples of what Sonic can do:

- Perform database archival at regular interval (eg. at midnight every 24hours)
- Crawl your database once a week for records that can be archived and publish these in an other,
less dynamic storage
- Provide calendar reminders for your application (eg. a task is due)

Sonic features include:

- persistence: it makes your jobs resilient (out of the box with postgres, redis and filesystem)
- monitoring/audit: Sonic comes with a user interface for your jobs statuses and can notify you of
failures
- scalable: run many instances to handle real production load
- customizable store: straightforward implementation of your own custom store (eg. mysql)

# The basics

There are 2 ways that you can deploy Sonic. It can be embedded within your node.js instances or it
can be deployed as a standalone cluster of node.js instances, typically behind a load balancer.

Sonic works as a cluster of nodes, all of them behaving as a master and competing to execute
scheduled jobs.


# Objects

As a Sonic consumer, you will be defining ```Tasks``` and ```Schedules```.

Each task can contain one or more ```Schedules```. A ```Schedule``` define when a task is supposed
to run. A task that is running or that has run is a ```Job```.

## Tasks

A task, has the following properties:

| Property      | -sub     | Type    | Description                                                                                                                                                                             |
|---------------|----------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| name          |          | string  | each task is uniquely identifiable through a name within the system                                                                                                                     |
| minInterval   |          | integer | defines a minimum interval for this task in milliseconds. null by default. If set, the scheduler will make sure that this task does not run more than every <minInterval> milliseconds. |
| lastRun *     |          | Object  | an object representing the last triggered job                                                                                                                                           |
|               | id       | string  | the unique identifier of the last triggered job                                                                                                                                         |
|               | date     | Date    | represents the date of the last triggered job                                                                                                                                           |
|               | status   | string  | one of "succeeded", "failed", "running"                                                                                                                                                 |
| lastFailure * |          | Object  | an object representing the last failed job. Attributes same as above                                                                                                                    |
| lastSuccess * |          | Object  | an object representing the last successful job. Attributes same as above                                                                                                                |
| schedules     |          | Array   | An array of schedules, with no specific order                                                                                                                                           |
|               | type     | string  | The type of schedule. Can be one of "interval", "cron"                                                                                                                                  |
|               | interval | int     | The number of milliseconds between each job                                                                                                                                             |

Properties with a ```*``` are read only.

## Job

## Schedule

# Node.js API

## sonic.schedule()

    var sonic = new Sonic({})

    var task = {
      name: 'myTaskName',
      schedules: [{
        type: 'cron',
        cron: '* * * * *'
      }, {
        type: 'interval',
        interval: 60 * 60 * 1000 // every hour
      }]
    }

    sonic.schedule(task, function(err, scheduleId) {
    })

    // the following is an equivalent alternative
    sonic.schedule('myTaskName', ['* * * * *', 3600000], function(err, scheduleId) {})

    // or you can split it in 2 calls
    sonic.schedule('myTaskName', '* * * * *', function(err, scheduleId) {})
    sonic.schedule('myTaskName', 3600000, function(err, scheduleId) {})

    // and there are several ways of removing a schedule
    sonic.unschedule('myTaskName', scheduleId, function(err, scheduleId) {})
    sonic.unschedule('myTaskName', '* * * * *', function(err, scheduleId) {})

    // Here is how you declare your business logic
    sonic.on('myTaskName', function(taskName, scheduleId, jobId) {
      // task business logic here...

      // signal the progress if it is a long running job that you want to monitor
      this.progress(0.10) // with either a percentage
      this.progress('step1') // or steps
      this.progress(0.30, 'step2') // or both

      // when the task is finished, call this.done()
      this.done()
      // or if it failed, you can call this.fail(err) with an error object
      this.fail(new Error('The task failed to run'))
      this.fail('The task failed to run') // the error can also be a simple string
      this.fail({
        reason: 'database connection down'   // or an object with much more details
        details: {
          dbHost: 'serv1.domain.com',
          dbPort: 28017
        }
      })


    })

