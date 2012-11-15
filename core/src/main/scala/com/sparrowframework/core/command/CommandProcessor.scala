/**
  * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/14/12
 * Time: 10:31 PM
 */

package com.sparrowframework.core.command
import actors.Actor

class CommandProcessor() extends Actor {
  var commandMap = Map[String, CommandHandler]()
  override def act() = process()

  def process() {
    while (true) {
      receive {
        case command:Command => {
          commandMap(command.getName()).handle(command)
        }
      }
    }
  }

  def register(commandName: String, commandHandler: CommandHandler) {
        commandMap += (commandName -> commandHandler)
  }

}
