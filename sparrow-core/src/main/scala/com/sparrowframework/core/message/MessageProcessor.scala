package com.sparrowframework.core.message

trait MessageProcessor {
  def send(message:Message)(sendOperation: Message=>Unit) {
     sendOperation(message)
  }

  def receive()(receiveOperation: Unit=>Message):Message = {
    receiveOperation()
  }
}
