package com.sparrowframework.core.domain

import org.scalatest.FunSuite

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 12/7/12
 * Time: 5:13 PM
 */
class CustomerTest extends FunSuite {
  test("should save customer entity") {
    val customer = new Customer
    customer.save
  }
}
