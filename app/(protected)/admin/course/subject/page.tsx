import React from 'react'
import { Plus, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'


const SubjectPage = () => {

  

  return (
    <div className="mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Course Directory
        </h1>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="size-4" />
          Add New Course
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Department filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Department
          </label>
          <Select
            value={selectedDepartment}
            onValueChange={handleDepartmentChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.DepartmentID} value={d.DepartmentID}>
                  {d.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Level filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Level
          </label>
          <Select value={selectedLevel} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {uniqueLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="default"
            onClick={handleClearFilters}
            className="gap-2"
          >
            <SlidersHorizontal className="size-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Course table */}
      <div className="rounded-lg border bg-card">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[30%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Course Name
              </TableHead>
              <TableHead className="w-[12%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Code
              </TableHead>
              <TableHead className="w-[14%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Level
              </TableHead>
              <TableHead className="w-[20%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Department
              </TableHead>
              <TableHead className="w-[12%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Semesters
              </TableHead>

            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedCourses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No courses found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedCourses.map((course) => (
                <TableRow key={course.CourseID}>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-3">

                      <span className="font-medium text-foreground">
                        {course.Name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {course.CourseID}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={
                        levelColorMap[course.Level] ??
                        "bg-gray-100 text-gray-700 border-0"
                      }
                    >
                      {course.Level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {course.DepartmentName}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {course.TotalSemester}
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        {!isLoading && filteredCourses.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredCourses.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {filteredCourses.length}
              </span>{" "}
              results
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>

              {pageNumbers.map((p, idx) =>
                p === "ellipsis" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex size-8 items-center justify-center text-sm text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === currentPage ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create course dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new course to the directory.
            </DialogDescription>
          </DialogHeader>
          <CreateNewCourseForm
            departments={departments}
            onSubmit={handleCreateCourse}
            isSubmitting={isSubmitting}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SubjectPage
