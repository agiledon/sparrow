package com.sparrowframework.core

import command.CommandHandler
import xml.XML
import java.net.URL

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/15/12
 * Time: 1:02 PM
 */
object MessageProcessorFactory {
  def create(commandMap: Map[String, CommandHandler]): MessageProcessor = {
    val commandProcessor = new MessageProcessor()
    commandMap.foreach {
      case (key, value) => commandProcessor.register(key, value)
    }
    commandProcessor
  }

  def create: MessageProcessor = {
    create(readCommandMap)
  }

  private def readCommandMap: Map[String, CommandHandler] = {
    val commandsXml = XML.load(getResourceUrl("commands.xml"))
    (for {x <- commandsXml \ "command"}
    yield ((x \ "@name").toString, createCommandHandler((x \ "@handler").toString))).toMap
  }

  private def createCommandHandler(handlerType: String): CommandHandler = {
    Class.forName(handlerType).newInstance.asInstanceOf[CommandHandler]
  }

  private def getResourceUrl(xmlFileName: String): URL = {
    this.getClass().getClassLoader().getResource(xmlFileName)
  }
}
