package com.sparrowframework.core.event

import com.sparrowframework.core.{MessageBus, MessageProcessor}

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 2:02 PM
 */
object EventBus extends MessageBus {
  def publish(message: Event) {
    sendMessage(message)
  }
}
