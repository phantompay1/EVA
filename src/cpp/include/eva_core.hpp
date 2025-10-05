#pragma once

#include <vector>
#include <string>
#include <memory>
#include <unordered_map>
#include <future>
#include <chrono>
#include <Eigen/Dense>

namespace eva {

/**
 * EVA C++ Core - High-Performance Computational Engine
 * 
 * Provides optimized computational operations including:
 * - Matrix operations
 * - Signal processing  
 * - Computer vision
 * - Numerical optimization
 */

class EVACppCore {
public:
    struct ProcessingRequest {
        std::string method;
        std::string data;
        std::unordered_map<std::string, std::string> options;
        std::string request_id;
    };
    
    struct ProcessingResponse {
        std::string request_id;
        bool success;
        std::string result;
        std::string error;
        std::unordered_map<std::string, std::string> metadata;
    };
    
    struct PerformanceMetrics {
        uint64_t total_operations = 0;
        double average_processing_time = 0.0;
        uint64_t memory_usage = 0;
        double optimization_ratio = 0.0;
        uint32_t active_threads = 0;
    };

private:
    std::unique_ptr<class MatrixProcessor> matrix_processor_;
    std::unique_ptr<class SignalProcessor> signal_processor_;
    std::unique_ptr<class VisionProcessor> vision_processor_;
    std::unique_ptr<class OptimizationEngine> optimization_engine_;
    PerformanceMetrics metrics_;
    bool initialized_;

public:
    EVACppCore();
    ~EVACppCore();
    
    // Core methods
    bool initialize();
    ProcessingResponse process_request(const ProcessingRequest& request);
    std::vector<std::string> get_capabilities() const;
    PerformanceMetrics get_metrics() const;
    std::string health_check() const;
    
    // Specialized processing methods
    ProcessingResponse process_matrix_operation(const std::string& operation, const std::string& data);
    ProcessingResponse process_signal(const std::string& operation, const std::string& data);
    ProcessingResponse process_vision(const std::string& operation, const std::string& data);
    ProcessingResponse optimize(const std::string& target, const std::string& data);

private:
    void update_metrics(double processing_time);
    std::string serialize_result(const std::string& result) const;
    std::string get_timestamp() const;
};

/**
 * Matrix Processing Component
 */
class MatrixProcessor {
public:
    MatrixProcessor();
    
    // Matrix operations
    Eigen::MatrixXd multiply(const Eigen::MatrixXd& a, const Eigen::MatrixXd& b);
    Eigen::MatrixXd transpose(const Eigen::MatrixXd& matrix);
    Eigen::MatrixXd inverse(const Eigen::MatrixXd& matrix);
    Eigen::VectorXd eigenvalues(const Eigen::MatrixXd& matrix);
    Eigen::MatrixXd svd_decomposition(const Eigen::MatrixXd& matrix);
    
    // Linear algebra operations
    double determinant(const Eigen::MatrixXd& matrix);
    double condition_number(const Eigen::MatrixXd& matrix);
    Eigen::MatrixXd solve_linear_system(const Eigen::MatrixXd& A, const Eigen::VectorXd& b);
    
    // Advanced operations
    Eigen::MatrixXd parallel_multiply(const Eigen::MatrixXd& a, const Eigen::MatrixXd& b);
    std::string process_request(const std::string& operation, const std::string& data);
    std::vector<std::string> get_capabilities() const;

private:
    Eigen::MatrixXd parse_matrix_from_string(const std::string& data);
    std::string matrix_to_string(const Eigen::MatrixXd& matrix) const;
};

/**
 * Signal Processing Component
 */
class SignalProcessor {
public:
    SignalProcessor();
    
    // Signal processing operations
    std::vector<double> apply_filter(const std::vector<double>& signal, const std::string& filter_type);
    std::vector<double> fft(const std::vector<double>& signal);
    std::vector<double> ifft(const std::vector<double>& spectrum);
    std::vector<double> convolve(const std::vector<double>& signal1, const std::vector<double>& signal2);
    
    // Advanced signal processing
    std::vector<double> denoise(const std::vector<double>& signal, double threshold);
    std::vector<double> resample(const std::vector<double>& signal, double factor);
    double calculate_snr(const std::vector<double>& signal, const std::vector<double>& noise);
    
    std::string process_request(const std::string& operation, const std::string& data);
    std::vector<std::string> get_capabilities() const;

private:
    std::vector<double> parse_signal_from_string(const std::string& data);
    std::string signal_to_string(const std::vector<double>& signal) const;
    std::vector<double> apply_lowpass_filter(const std::vector<double>& signal, double cutoff);
    std::vector<double> apply_highpass_filter(const std::vector<double>& signal, double cutoff);
    std::vector<double> apply_bandpass_filter(const std::vector<double>& signal, double low, double high);
};

/**
 * Computer Vision Processing Component
 */
class VisionProcessor {
public:
    VisionProcessor();
    
    // Image processing operations
    Eigen::MatrixXd gaussian_blur(const Eigen::MatrixXd& image, double sigma);
    Eigen::MatrixXd edge_detection(const Eigen::MatrixXd& image, const std::string& method);
    Eigen::MatrixXd resize_image(const Eigen::MatrixXd& image, int new_width, int new_height);
    
    // Feature extraction
    std::vector<double> extract_features(const Eigen::MatrixXd& image, const std::string& method);
    std::vector<std::pair<int, int>> detect_corners(const Eigen::MatrixXd& image);
    
    // Advanced operations
    Eigen::MatrixXd morphological_operation(const Eigen::MatrixXd& image, const std::string& operation);
    double calculate_image_similarity(const Eigen::MatrixXd& img1, const Eigen::MatrixXd& img2);
    
    std::string process_request(const std::string& operation, const std::string& data);
    std::vector<std::string> get_capabilities() const;

private:
    Eigen::MatrixXd parse_image_from_string(const std::string& data);
    std::string image_to_string(const Eigen::MatrixXd& image) const;
    Eigen::MatrixXd apply_sobel_filter(const Eigen::MatrixXd& image);
    Eigen::MatrixXd apply_canny_edge_detection(const Eigen::MatrixXd& image, double low_threshold, double high_threshold);
};

/**
 * Optimization Engine Component
 */
class OptimizationEngine {
public:
    struct OptimizationResult {
        std::vector<double> optimal_solution;
        double optimal_value;
        int iterations;
        bool converged;
        double convergence_error;
    };
    
    OptimizationEngine();
    
    // Optimization algorithms
    OptimizationResult gradient_descent(
        const std::function<double(const std::vector<double>&)>& objective,
        const std::vector<double>& initial_guess,
        double learning_rate = 0.01,
        int max_iterations = 1000
    );
    
    OptimizationResult simulated_annealing(
        const std::function<double(const std::vector<double>&)>& objective,
        const std::vector<double>& initial_guess,
        double initial_temperature = 100.0,
        double cooling_rate = 0.95
    );
    
    OptimizationResult particle_swarm_optimization(
        const std::function<double(const std::vector<double>&)>& objective,
        int dimensions,
        int num_particles = 30,
        int max_iterations = 1000
    );
    
    // Numerical methods
    std::vector<double> solve_ode(
        const std::function<double(double, double)>& ode,
        double y0,
        double t0,
        double tf,
        int steps
    );
    
    double integrate_simpson(
        const std::function<double(double)>& func,
        double a,
        double b,
        int intervals
    );
    
    std::string process_request(const std::string& operation, const std::string& data);
    std::vector<std::string> get_capabilities() const;

private:
    std::vector<double> parse_vector_from_string(const std::string& data);
    std::string vector_to_string(const std::vector<double>& vec) const;
    std::function<double(const std::vector<double>&)> parse_objective_function(const std::string& func_desc);
};

// Utility functions
namespace utils {
    std::string json_escape(const std::string& input);
    std::vector<std::string> split_string(const std::string& input, char delimiter);
    double current_timestamp();
    std::string format_duration(double seconds);
    size_t get_memory_usage();
}

} // namespace eva