package com.sparrowframework.core.command

import com.sparrowframework.core.domain.Custom
import com.sparrowframework.core.event.{CustomEventHandler, CustomEvent}
import com.sparrowframework.core.event.interceptor.LoggingInterceptor

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/15/12
 * Time: 1:23 PM
 */
class CustomCommandHandler extends CommandHandler {
  def handle(command: Command) {
    println("receive command")

    command match {
      case customCommand: CustomCommand =>
        val custom = new Custom

        custom.save(customCommand)
        command.receive
      case _ => println("Not supported command")
    }
  }
}
