/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/14/12
 * Time: 10:31 PM
 */

package com.sparrowframework.core

import actors.Actor
import command.{Command, CommandHandler}
import event.{EventHandler, Event}
import xml.XML
import java.net.URL

class MessageProcessor private extends Actor {
  var commandMap = Map[String, CommandHandler]()

  override def act() {
    process
  }

  def process {
    while (true) {
      receive {
        case command: Command =>
          commandMap(command.commandName).handle(command)
        case event: Event =>
          event.getHandlers.foreach {
            handler: EventHandler => handler.handle(event)
          }
      }
    }
  }

  def register(commandName: String, commandHandler: CommandHandler) {
    commandMap += (commandName -> commandHandler)
  }

}

object MessageProcessor {
  def apply() = create(readCommandMap)

  private def create(commandMap: Map[String, CommandHandler]): MessageProcessor = {
    val commandProcessor = new MessageProcessor()
    commandMap.foreach {
      case (key, value) => commandProcessor.register(key, value)
    }
    commandProcessor
  }

  private def readCommandMap: Map[String, CommandHandler] = {
    val commandsXml = XML.load(getResourceUrl("commands.xml"))
    (
      for {x <- commandsXml \ "command"}
      yield ((x \ "@name").toString, createCommandHandler((x \ "@handler").toString))
      ).toMap
  }

  private def createCommandHandler(handlerType: String): CommandHandler = {
    Class.forName(handlerType).newInstance.asInstanceOf[CommandHandler]
  }

  private def getResourceUrl(xmlFileName: String): URL = {
    this.getClass.getClassLoader.getResource(xmlFileName)
  }
}
