package com.sparrowframework.core.command

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/15/12
 * Time: 1:23 PM
 */
class CustomCommandHandler extends CommandHandler{
  def handle(command: Command) {
    println("receive message")
    command.receive
  }
}
