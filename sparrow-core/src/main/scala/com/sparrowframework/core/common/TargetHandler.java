package com.sparrowframework.core.common;

import java.lang.annotation.*;

/**
 * Created with IntelliJ IDEA.
 * User: Zhang Yi
 * Date: 11/27/12
 * Time: 1:44 PM
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface TargetHandler {
    Class[] target();
}
