/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/14/12
 * Time: 10:30 PM
 */

package com.sparrowframework.core.command

object CommandBus {
  def send[T <: Command](message: T) {
    val commandProcessor = new CommandProcessor[CommandHandler]()
    commandProcessor.register("commandName", new CommandHandler())
    commandProcessor.start()
    commandProcessor ! message
  }
}

