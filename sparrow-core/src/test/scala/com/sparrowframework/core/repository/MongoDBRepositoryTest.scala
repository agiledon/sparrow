package com.sparrowframework.core.repository

import org.scalatest.FunSuite
import com.sparrowframework.core.domain.Customer

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 12/7/12
 * Time: 5:16 PM
 */
class MongoDBRepositoryTest extends FunSuite {
  test("should save data to mongodb") {
    val repository = MongoDBRepository[Customer]
    repository.save(new Customer)
  }
}
