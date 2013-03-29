package com.sparrowframework.core.domain

import com.sparrowframework.core.event.CustomerEvent
import com.sparrowframework.core.command.Command
import com.sparrowframework.core.repository.{Repository, MongoDBRepository}

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/25/12
 * Time: 5:36 PM
 */
class Customer() extends AggregateRoot {
  val repository = MongoDBRepository[Customer]

  addEvent { void =>
    new CustomerEvent("event name")
  }

  override protected def saveEntity() {
    repository.save(this)
  }

  def toJsonList = {
    List("user" -> "zhangyi", "blog" -> "www.agiledon.com")
  }
}
