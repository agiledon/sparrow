package com.sparrowframework.core.event.interceptor

import com.sparrowframework.core.event.{Event, EventHandler}

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/23/12
 * Time: 5:46 PM
 */
trait LoggingInterceptor extends EventHandler{
  abstract override def handle(event: Event){
    println("logging: the event " + event.eventName + " was handled.")
    super.handle(event)
  }


}
