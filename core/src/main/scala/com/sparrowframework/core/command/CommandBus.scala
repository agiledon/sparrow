/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/14/12
 * Time: 10:30 PM
 */

package com.sparrowframework.core.command

import com.sparrowframework.core.{MessageBus, MessageProcessorFactory, MessageProcessor}

object CommandBus extends MessageBus {
  def send(message: Command) {
    sendMessage(message)
  }


}

