// TODO: this is a generic/abstract class to messaging between players
// e.g. this is the parent class for WhipserResponse, ShoutResponse, and ChatResponse
/*
  Whisper -> only allowed between two players
  Chat    -> anyone in the current room can hear (given language understanding)
  Shout   -> anyone in the current vicinity (e.g. 3-room radius) can hear

  As for 'language understanding', if a player cannot understand the language a
  a message/response is uttered in, then the message content is substituted for
  something like "[player] says something to the room".
*/
