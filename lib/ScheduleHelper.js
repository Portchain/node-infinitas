
function shouldRunNow(task) {

  var now = new Date()

  if(!task.schedules)  {
    return
  }

  for(var i = 0 ; i < task.schedules.length ; i++) {
    var schedule = task.schedules[i]
    if(schedule) {
      switch(schedule.type) {

        case 'cron':
          if(schedule.interval.next() <= now) {
            return schedule
          }
          break

        case 'interval':
          if(!task.lastRun || schedule.data >= (now.getTime() - task.lastRun.date.getTime()) ) {
            return schedule
          }
          break
      }
    }
  }

}

function isInterval(schedule) {
  return schedule.type === 'interval'
}

function isCron(schedule) {
  return schedule.type === 'cron'
}

module.exports = {
  shouldRunNow : shouldRunNow,
  isInterval   : isInterval,
  isCron       : isCron
}
