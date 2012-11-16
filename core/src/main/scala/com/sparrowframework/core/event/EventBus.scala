package com.sparrowframework.core.event

import com.sparrowframework.core.{MessageProcessorFactory, MessageProcessor}

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 2:02 PM
 */
object EventBus {
  def send(message: Event) {
    val messageProcessor: MessageProcessor = {
      MessageProcessorFactory.create
    }
    messageProcessor.start
    messageProcessor ! message
  }
}
