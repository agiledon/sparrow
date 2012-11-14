/**
  * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/14/12
 * Time: 10:31 PM
 */

package com.sparrowframework.core.command
import actors.Actor

class CommandProcessor() extends Actor {
  def act() {
    while (true) {
      receive {
        case msg => println(msg)
      }
    }
  }
}
