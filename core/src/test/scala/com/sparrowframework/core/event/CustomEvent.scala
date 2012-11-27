package com.sparrowframework.core.event

import com.sparrowframework.core.common.TargetHandler

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/16/12
 * Time: 3:18 PM
 */
@TargetHandler(target = classOf[CustomEventHandler])
class CustomEvent(eventName: String) extends Event(eventName)
