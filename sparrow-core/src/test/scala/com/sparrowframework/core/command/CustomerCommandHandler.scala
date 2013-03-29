package com.sparrowframework.core.command

import com.sparrowframework.core.domain.Customer

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/15/12
 * Time: 1:23 PM
 */
class CustomerCommandHandler extends CommandHandler {
  def handle(command: Command) {
    println("receive command")

    command match {
      case customCommand: CustomerCommand =>
        val custom = new Customer

        custom.save
        command.receive
      case _ => println("Not supported command")
    }
  }
}
