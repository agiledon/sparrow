package com.sparrowframework.core.command

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/15/12
 * Time: 10:01 AM
 */
abstract class CommandHandler {
  def handle(command: Command)
}
