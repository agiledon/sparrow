/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/14/12
 * Time: 10:30 PM
 */

package com.sparrowframework.core.command

import com.sparrowframework.core.{MessageProcessorFactory, MessageProcessor}

object CommandBus {
  def send(message: Command) {
    val messageProcessor: MessageProcessor = {
      MessageProcessorFactory.create
    }
    messageProcessor.start
    messageProcessor ! message
  }


}

