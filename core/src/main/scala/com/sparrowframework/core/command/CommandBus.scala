/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/14/12
 * Time: 10:30 PM
 */

package com.sparrowframework.core.command

object CommandBus {
  def send(message: String) {
    val commandProcessor = new CommandProcessor
    commandProcessor ! message
  }
}

