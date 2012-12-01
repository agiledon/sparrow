package com.sparrowframework.core.event

import com.sparrowframework.core.common.TargetHandler

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/30/12
 * Time: 8:43 PM
 */
@TargetHandler(target = Array(classOf[SuccessfulEventHandler], classOf[CompletedEventHandler]))
class CreateOrderEvent(eventName: String) extends Event(eventName)