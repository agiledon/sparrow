package com.sparrowframework.core.command

import com.sparrowframework.core.common.TargetHandler

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/15/12
 * Time: 1:25 PM
 */
@TargetHandler(target = Array(classOf[CustomerCommandHandler]))
class CustomerCommand(commandName: String) extends Command(commandName)
