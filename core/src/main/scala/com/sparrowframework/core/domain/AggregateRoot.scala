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
  val id: UUID

  protected def sendEvent()(event: Unit => Event) {
    EventBus send event()
  }
}
