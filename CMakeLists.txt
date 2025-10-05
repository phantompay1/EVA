cmake_minimum_required(VERSION 3.20)
project(EVACore VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(Protobuf REQUIRED)
find_package(gRPC REQUIRED)
find_package(Eigen3 REQUIRED)
find_package(OpenMP REQUIRED)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/cpp/include)

# Source files
file(GLOB_RECURSE SOURCES "src/cpp/*.cpp")

# Create shared library for EVA C++ modules
add_library(eva_core SHARED ${SOURCES})

# Link libraries
target_link_libraries(eva_core 
    protobuf::libprotobuf
    gRPC::grpc++
    Eigen3::Eigen
    OpenMP::OpenMP_CXX
)

# Install targets
install(TARGETS eva_core DESTINATION lib)
install(DIRECTORY src/cpp/include/ DESTINATION include)