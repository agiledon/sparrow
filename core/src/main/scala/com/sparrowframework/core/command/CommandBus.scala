/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/14/12
 * Time: 10:30 PM
 */

package com.sparrowframework.core.command

object CommandBus {
  def send(message: Command) {
    val commandProcessor: CommandProcessor = {
      CommandProcessorFactory.create
    }
    commandProcessor.start
    commandProcessor ! message
  }


}

