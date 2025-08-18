import React, { useState, useMemo, useCallback } from 'react';
import Header from './HeaderWithBack';
import { debounce } from '../utils/optimizations';
import '../styles/optimized.css';

const StudentFeed = ({
  selectedBranch,
  problems,
  onOpenIdeaModal,
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  isLoggedIn,
  currentUser,
  userRole,
  handleLogout,
  setCurrentView,
  handleBack,
  onProfileClick
}) => {
  // State management
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [branchFilter, setBranchFilter] = useState(selectedBranch || 'all');
  const [showFilters, setShowFilters] = useState(false);

  // Memoized branches list
  const branches = useMemo(() => [
    { value: 'mechanical', label: 'Mechanical Engineering' },
    { value: 'computer', label: 'Computer Science' },
    { value: 'electrical', label: 'Electrical Engineering' },
    { value: 'civil', label: 'Civil Engineering' },
    { value: 'chemical', label: 'Chemical Engineering' },
    { value: 'aerospace', label: 'Aerospace Engineering' },
    { value: 'biomedical', label: 'Biomedical Engineering' },
    { value: 'industrial', label: 'Industrial Engineering' },
    { value: 'electronics', label: 'Electronics and Communication' },
    { value: 'it', label: 'Information Technology' }
  ], []);

  // Memoized callbacks
  const handleFilterClick = useCallback((filter) => {
    setActiveFilter(filter);
  }, [setActiveFilter]);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleBranchChange = useCallback((selectedBranchValue) => {
    setBranchFilter(selectedBranchValue);
  }, []);

  // Debounced search handler
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    [setSearchTerm]
  );

  // Memoized filtering functions
  const filterProblemsByBranch = useCallback((problemsArray, branchValue) => {
    if (!problemsArray?.length) return [];
    if (branchValue === 'all') return problemsArray;
    return problemsArray.filter(problem => problem.branch === branchValue);
  }, []);

  const applyFilters = useCallback((problems) => {
    if (!problems?.length) return [];
    
    return problems.filter(problem => {
      const matchesSearch = !searchTerm || 
        problem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.company?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesFilter = true;
      switch (activeFilter) {
        case 'new': 
          matchesFilter = problem.createdAt && 
            (new Date() - new Date(problem.createdAt)) < 7 * 24 * 60 * 60 * 1000;
          break;
        case 'urgent': 
          matchesFilter = problem.difficulty === 'advanced';
          break;
        case 'trending': 
          matchesFilter = problem.ideas?.length > 0;
          break;
        case 'beginner':
        case 'intermediate':
        case 'advanced':
          matchesFilter = problem.difficulty?.toLowerCase() === activeFilter;
          break;
        default:
          matchesFilter = true;
      }
      
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, activeFilter]);

  // Memoized filtered problems
  const filteredProblems = useMemo(() => {
    const branchFiltered = filterProblemsByBranch(problems, branchFilter);
    return applyFilters(branchFiltered);
  }, [problems, branchFilter, filterProblemsByBranch, applyFilters]);

  // Event handlers with useCallback
  const handleProblemClick = useCallback((problem) => {
    setSelectedProblem(problem);
    setShowProblemModal(true);
  }, []);

  const closeProblemModal = useCallback(() => {
    setShowProblemModal(false);
    setSelectedProblem(null);
  }, []);

  const handleCompanyClick = useCallback((companyName) => {
    if (companyName) {
      setSearchTerm(companyName);
      setActiveFilter('all');
    }
  }, [setSearchTerm, setActiveFilter]);

  // Memoized UI helpers
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  }, []);

  const getDifficultyColor = useCallback((difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#9E9E9E';
    }
  }, []);

  return (
    <div className="student-feed">
      <Header
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        userRole={userRole}
        handleLogout={handleLogout}
        setCurrentView={setCurrentView}
        currentView="studentFeed"
        handleBack={handleBack}
        onProfileClick={onProfileClick}
      />

      {/* Rest of your JSX remains the same */}
      {/* Just use the optimized functions and memoized values */}
    </div>
  );
};

// Export memoized component
export default React.memo(StudentFeed);
