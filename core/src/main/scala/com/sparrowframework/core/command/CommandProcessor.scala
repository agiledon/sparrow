/**
  * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/14/12
 * Time: 10:31 PM
 */

package com.sparrowframework.core.command
import actors.Actor

class CommandProcessor[THandler <: CommandHandler]() extends Actor {
  var commandMap = Map[String, THandler]()
  def act() {
    while (true) {
      receive {
        case command:Command => {
          commandMap(command.name).handle(command)
        }
      }
    }
  }

  def register(commandName: String, commandHandler: THandler) {
        commandMap += (commandName -> commandHandler)
  }

}
