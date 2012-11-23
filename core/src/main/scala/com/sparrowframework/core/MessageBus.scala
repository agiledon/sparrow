package com.sparrowframework.core

import command.Command
import event.Event


/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 3:34 PM
 */
trait MessageBus {
  def sendMessage(message: Message) {
    val messageProcessor = MessageProcessor()
    messageProcessor.start
    messageProcessor ! message
  }
}
