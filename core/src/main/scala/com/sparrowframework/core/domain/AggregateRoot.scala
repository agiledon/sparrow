package com.sparrowframework.core.domain

import java.util.UUID
import com.sparrowframework.core.event.{EventBus, Event}
import com.sparrowframework.core.command.Command

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/23/12
 * Time: 7:38 PM
 */
abstract class AggregateRoot {
  val id: UUID = UUID.randomUUID()
  var events = Set[Event]()

  def addEvent()(event :Unit => Event) {
    events += event()
  }

  def save(command: Command) {
    saveCommand(command)
    raiseEvents
  }

  protected def saveCommand(command: Command)

  private def raiseEvents {
    events.foreach {
      EventBus send _
    }
  }
}
