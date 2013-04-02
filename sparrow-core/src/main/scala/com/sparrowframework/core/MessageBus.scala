package com.sparrowframework.core

import command.Command
import event.Event
import message.Message


/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 3:34 PM
 */
abstract class MessageBus {
  def send(message: Message) {
    val messageProcessor = AdhocMessageProcessor()
    messageProcessor.send(message)
  }
}
