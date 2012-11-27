/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/14/12
 * Time: 10:31 PM
 */

package com.sparrowframework.core

import actors.Actor
import command.{Command, CommandHandler}
import common.HandlerGetter
import event.{EventHandler, Event}

class MessageProcessor private extends Actor with HandlerGetter {
  var commandMap = Map[String, CommandHandler]()

  override def act() {
    process
  }

  private def process {
    while (true) {
      receive {
        case command: Command =>
          get[CommandHandler](command).foreach {
            handler => handler.handle(command)
          }
        case event: Event =>
          get[EventHandler](event).foreach {
            handler => handler.handle(event)
          }
      }
    }
  }
}

object MessageProcessor {
  def apply() = new MessageProcessor
}
