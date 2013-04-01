import sbt._

object MultipleModuleProjectBuild extends Build {
  lazy val root = Project(id = "sparrow",
    base = file(".")) aggregate(core)
  lazy val core = Project(id = "sparrow-core",
    base = file("sparrow-core"))
}