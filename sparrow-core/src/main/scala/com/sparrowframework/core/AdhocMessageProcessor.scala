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
import message.{Message, MessageProcessor}

class AdhocMessageProcessor private extends Actor with HandlerGetter with MessageProcessor {
  def send(message: Message) {
    this.start
    this ! message
  }

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

object AdhocMessageProcessor {
  def apply() = new AdhocMessageProcessor
}
