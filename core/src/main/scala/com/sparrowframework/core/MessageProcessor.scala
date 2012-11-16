/**
  * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/14/12
 * Time: 10:31 PM
 */

package com.sparrowframework.core

import actors.Actor
import command.{Command, CommandHandler}
import event.{Event}

class MessageProcessor() extends Actor {
  var commandMap = Map[String, CommandHandler]()

  override def act() {
    process
  }

  def process() {
    while (true) {
      receive {
        case command: Command =>
          commandMap(command.getName).handle(command)
        case event: Event =>
          event.getHandlers().foreach {
            handler => handler.handle(event)
          }
      }
    }
  }

  def register(commandName: String, commandHandler: CommandHandler) {
        commandMap += (commandName -> commandHandler)
  }

}
