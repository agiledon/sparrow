package com.sparrowframework.core.command

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/15/12
 * Time: 1:02 PM
 */
object CommandProcessorFactory {
  def create[T <: CommandHandler](commandMap: Map[String, T]): CommandProcessor[T] = {
    val commandProcessor = new CommandProcessor[T]()
    commandMap.foreach {case(key, value) => commandProcessor.register(key, value)}
    commandProcessor
  }

}
