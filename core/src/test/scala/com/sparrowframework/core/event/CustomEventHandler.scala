package com.sparrowframework.core.event

import interceptor.LoggingInterceptor

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 3:19 PM
 */
class CustomEventHandler extends EventHandler {
  def handle(event: Event) {
    println("receive event")
    event.trigger
  }
}
