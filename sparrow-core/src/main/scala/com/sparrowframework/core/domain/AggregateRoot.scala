package com.sparrowframework.core.domain

import java.util.UUID
import com.sparrowframework.core.event.{EventBus, Event}

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/23/12
 * Time: 7:38 PM
 */
abstract class AggregateRoot {
  val id: UUID = UUID.randomUUID()
  var events = Set[Event]()

  def addEvent(event :Unit => Event) {
    events += event()
  }

  def save {
    saveEntity()
    raiseEvents
  }

  def toJsonList:List[(String, String)]

  protected def saveEntity()

  private def raiseEvents {
    events.foreach {
      EventBus publish _
    }
  }
}
