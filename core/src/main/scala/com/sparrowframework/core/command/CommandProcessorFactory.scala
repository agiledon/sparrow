package com.sparrowframework.core.command

import xml.XML
import java.io.File
import java.net.URL

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/15/12
 * Time: 1:02 PM
 */
object CommandProcessorFactory {
  def create(commandMap: Map[String, CommandHandler]): CommandProcessor = {
    val commandProcessor = new CommandProcessor()
    commandMap.foreach {
      case (key, value) => commandProcessor.register(key, value)
    }
    commandProcessor
  }

  def create(): CommandProcessor = {
    create(readCommandMap())
  }


  private def readCommandMap(): Map[String, CustomCommandHandler] = {
    val commandsXml = XML.load(getResourceUrl("commands.xml"))
    (for {x <- commandsXml \ "command"}
    yield ((x \ "@name").toString, new CustomCommandHandler)).toMap
  }

  private def getResourceUrl(xmlFileName: String): URL = {
    this.getClass().getClassLoader().getResource(xmlFileName)
  }
}
