
var pubnub = new PubNub({
  subscribeKey: ENV.PUBNUB_SUBSCRIBE_KEY,
  publishKey: ENV.PUBNUB_PUBLISH_KEY,
  authKey: user.pubnubAuthKey,
  ssl: true
})

var chats = document.getElementsByClassName('chat');

for(var i = 0 ; i < chats.length ; i++) {
  let chat = chats[i]
  let channelId = chat.id

  let textArea = chat.getElementsByTagName('textarea')[0]
  
  pubnub.addListener({
    message: function(data) {
      appendMessage(data.message)
    }
  })
  let input = chat.getElementsByTagName('input')[0]

  function appendMessage(message) {
      textArea.value += '[' + message.from + '] '
      textArea.value += message.value + '\n'
  }
  
  let sendButton = chat.getElementsByTagName('button')[0]
  sendButton.addEventListener('click', function(event) {
    event.preventDefault()
    let message = input.value
    input.value = ''
    if(message) {
      pubnub.publish(
        {
          message: {
            value: message,
            from: user.email
          },
          channel: channelId
        }, 
        function (status, response) {
          if (status.error) {
            console.log(status)
          }
        }
      );
    }
    return false;
  })

  pubnub.history(
    {
      channel: channelId,
      reverse: true, // Setting to true will traverse the time line in reverse starting with the oldest message first.
      count: 20 // how many items to fetch
    },
    function (status, response) {
      if(response && response.messages) {
        for(var i = 0 ; i < response.messages.length ; i++) {
          appendMessage(response.messages[i].entry)
        }
      }
    }
  );
  pubnub.subscribe({
    channels: [channelId]
  });

}


