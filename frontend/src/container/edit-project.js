import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import NumberInputComponent from "../components/NumberInputComponent";
import Aetextarea from "../components/Aetextarea";
import SelectComponent from "../components/SelectComponent";
import DateInput from "../components/DateInput";
import DataTable from "../components/DataTable";
import CheckboxInput from "../components/CheckboxInput";
import SkillInput from "../components/SkillInput";
import CategoryInput from "../components/CategoryInput";
import TagInput from "../components/TagInput";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makePutRequest, makeGetRequest, makePostRequest } from "../utils/api";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useSweetAlert } from "../components/SweetAlert";
import { getLoggedInUser } from "../utils/auth";
import _ from "lodash";

const EditProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showAlert } = useSweetAlert();
  const [formData, setFormData] = useState({
    client_id: null,
    project_title: "",
    project_category: null,
    deadline: null,
    project_description: "",
    budget: null,
    tags: [],
    skills_required: [],
    reference_links: "",
    additional_notes: "",
    projects_type: "",
    project_format: "",
    audio_voiceover: "No",
    audio_description: "",
    video_length: null,
    preferred_video_style: "",
    sample_project_file: [],
    project_files: [],
    show_all_files: false,
    is_active: "0",
    created_by: null,
    updated_by: null,
    is_deleted: false,
    deleted_by: null,
    deleted_at: null,
    status: {},
    url: "",
    meta_title: "",
    meta_description: "",
  });
  const [sampleProjectFile, setSampleProjectFile] = useState(null);
  const [uploadedProjectFiles, setUploadedProjectFiles] = useState([]);
  const tableRef = useRef();
  const [uploadedShowFiles, setUploadedShowFiles] = useState([]);
  const [showAllFiles, setShowAllFiles] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [skillsTags, setSkillsTags] = useState([]);
  const [availableCategories, setAvailableCategory] = useState([]);
  const [showAudioDescription, setShowAudioDescription] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialState, setInitialState] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [clients, setClients] = useState([]);
  const [ApplicationaData, setApplicationaData] = useState([]);
  const [viewMode, setViewMode] = useState("form")

  const areObjectsEqual = (obj1, obj2) => {
    return _.isEqual(obj1, obj2);
  };

  const slugify = (s) =>
    (s || "")
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const [touched, setTouched] = useState({
    url: false,
    meta_title: false,
    meta_description: false,
  });
  const markTouched = (name) => () => setTouched((t) => ({ ...t, [name]: true }));

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const user = getLoggedInUser();
        if (!user?.user_id) {
          showErrorToast("Please log in to edit projects.");
          navigate("/login");
          return;
        }

        const fetchClients = async () => {
          try {
            const response = await makeGetRequest("users/client/active", {});
            const fetchedClients = response.data?.data || [];
            const clientOptions = fetchedClients.map((client) => ({
              value: client.user_id,
              label: client.name || `${client.first_name || ""} ${client.last_name || ""}`.trim(),
            }));
            setClients(clientOptions);
          } catch (error) {
            console.error("Failed to fetch clients:", error);
            showErrorToast("Failed to load clients.");
          }
        };

        const fetchCategories = async () => {
          try {
            // use your existing route
            const response = await makeGetRequest("category/getallcategorys");
            const fetchedCategories = response.data?.data || [];
            const categoryOptions = fetchedCategories.map((cat) => ({
              value: cat.category_id,
              label: cat.category_name || cat.name,
            }));
            setAvailableCategory(categoryOptions);
            return categoryOptions;
          } catch (error) {
            console.error("Failed to fetch categories:", error);
            showErrorToast("Failed to load categories.");
          }
        };

        const payload = { projects_task_id: parseInt(id, 10) };
        const response = await makePostRequest("projectsTask/getprojects_taskbyid", payload);
        console.log("Project Data: ", response);
        const project = response.data.projects;

        setCanEdit(user.user_id === project.created_by);
        const categoryOptions = await fetchCategories();
        const projectCategoryName = project.project_category || "";
        const selectedCategory = categoryOptions.find(
          (opt) => opt.label.toLowerCase() === projectCategoryName.toLowerCase() // Case-insensitive match
        );
        const categoryId = selectedCategory ? selectedCategory.value : null;

        let parsedTags = [];
        if (Array.isArray(project.tags)) {
          parsedTags = project.tags;
        } else if (typeof project.tags === "string") {
          try {
            parsedTags = JSON.parse(project.tags);
          } catch (e) {
            console.error("Error parsing tags:", e);
            parsedTags = [];
          }
        }
        setSelectedTags(parsedTags);

        let parsedSkills = [];
        if (Array.isArray(project.skills_required)) {
          parsedSkills = project.skills_required.map(skill => {
            if (typeof skill === "string") return { skill_id: skill, skill_name: skill };
            if (skill?.skill_name) return skill;
            return null;
          }).filter(Boolean);
        } else if (typeof project.skills_required === "string") {
          try {
            parsedSkills = JSON.parse(project.skills_required).map(skill => {
              if (typeof skill === "string") return { skill_id: skill, skill_name: skill };
              if (skill?.skill_name) return skill;
              return null;
            }).filter(Boolean);
          } catch (e) {
            parsedSkills = [];
          }
        }
        setSkillsTags(parsedSkills);


        const newFormData = {
          client_id: project.client_id ? parseInt(project.client_id, 10) : null,
          project_title: project.project_title || "",
          project_category: categoryId,
          deadline: project.deadline || null,
          project_description: project.project_description || "",
          budget: project.budget || null,
          tags: parsedTags,
          skills_required: parsedSkills,
          reference_links: Array.isArray(project.reference_links)
            ? project.reference_links[0] || ""
            : "",
          additional_notes: project.additional_notes || "",
          projects_type: project.projects_type || "",
          project_format: project.project_format || "",
          audio_voiceover: project.audio_voiceover || "No",
          audio_description: project.audio_description || "",
          video_length: project.video_length || null,
          preferred_video_style: project.preferred_video_style || "",
          sample_project_file:
            typeof project.sample_project_file === "string"
              ? JSON.parse(project.sample_project_file || "[]")
              : Array.isArray(project.sample_project_file)
                ? project.sample_project_file
                : [],
          project_files:
            typeof project.project_files === "string"
              ? JSON.parse(project.project_files || "[]")
              : Array.isArray(project.project_files)
                ? project.project_files
                : [],
          show_all_files: !!project.show_all_files,
          is_active: project.is_active?.toString() || "0",
          created_by: project.created_by || null,
          updated_by: project.updated_by || null,
          is_deleted: !!project.is_deleted,
          deleted_by: project.deleted_by || null,
          deleted_at: project.deleted_at || null,
          status: project.status || {},
          url: project.url || slugify(project.project_title || ""),
          meta_title: project.meta_title || project.project_title || "",
          meta_description: project.meta_description || (project.project_description || "").toLowerCase(),
        };

        setFormData(newFormData);

        setShowAudioDescription(
          Boolean(newFormData.audio_description && newFormData.audio_description.trim())
        );

        const sampleFile =
          Array.isArray(newFormData.sample_project_file) &&
            newFormData.sample_project_file.length > 0
            ? newFormData.sample_project_file[0]
            : null;

        const sampleProjectFileState = sampleFile
          ? {
            file: { name: sampleFile.filename || sampleFile.url?.split("/").pop() },
            isValid: true,
            fileUrl: sampleFile.url || sampleFile,
            uploading: false,
          }
          : null;

        const projectFilesState = Array.isArray(newFormData.project_files)
          ? newFormData.project_files
            .filter((file) => file && (file.url || typeof file === "string"))
            .map((file) => {
              const fileUrl = typeof file === "string" ? file : file.url;
              return {
                file: {
                  name:
                    (file && file.filename) ||
                    (fileUrl && fileUrl.split("/").pop()) ||
                    "Unnamed File",
                },
                isValid: true,
                fileUrl,
                uploading: false,
              };
            })
          : [];

        setSampleProjectFile(sampleProjectFileState);
        setUploadedProjectFiles(projectFilesState);
        setUploadedShowFiles(newFormData.show_all_files ? projectFilesState : []);
        setShowAllFiles(newFormData.show_all_files);
        setSelectedTags(parsedTags);
        setSkillsTags(parsedSkills);
        setShowAudioDescription(
          newFormData.audio_voiceover === "Yes" && newFormData.audio_description
        );

        setInitialState({
          formData: { ...newFormData },
          sampleProjectFile: sampleProjectFileState ? sampleProjectFileState.fileUrl : null,
          uploadedProjectFiles: projectFilesState.map((f) => f.fileUrl),
          uploadedShowFiles: newFormData.show_all_files
            ? projectFilesState.map((f) => f.fileUrl)
            : [],
          showAllFiles: newFormData.show_all_files,
          selectedTags: [...parsedTags],
          skillsTags: [...parsedSkills],
          showAudioDescription:
            newFormData.audio_voiceover === "Yes" && newFormData.audio_description,
        });

        setLoading(false);
        await fetchClients();
        await fetchCategories();
      } catch (error) {
        console.error("Failed to fetch project:", error);
        showErrorToast("Failed to load project data.");
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchProjectData();
    } else {
      showErrorToast("Please log in to edit projects.");
      navigate("/login");
    }
  }, [id, navigate]);

  useEffect(() => {
    setFormData((prev) => {
      const next = { ...prev };
      let changed = false;

      const slug = slugify(prev.project_title || "");
      if (!touched.url && slug && prev.url !== slug) {
        next.url = slug;
        changed = true;
      }

      if (!touched.meta_title && prev.meta_title !== (prev.project_title || "")) {
        next.meta_title = prev.project_title || "";
        changed = true;
      }

      const lowerDesc = (prev.project_description || "").toLowerCase();
      if (!touched.meta_description && prev.meta_description !== lowerDesc) {
        next.meta_description = lowerDesc;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [formData.project_title, formData.project_description, touched]);


  useEffect(() => {
    if (initialState) {
      const currentState = {
        formData: { ...formData },
        sampleProjectFile: sampleProjectFile ? sampleProjectFile.fileUrl : null,
        uploadedProjectFiles: uploadedProjectFiles.map((f) => f.fileUrl),
        uploadedShowFiles: uploadedShowFiles.map((f) => f.fileUrl),
        showAllFiles,
        selectedTags: [...selectedTags],
        skillsTags: [...skillsTags],
        showAudioDescription,
      };
      const hasFormChanges = !areObjectsEqual(currentState, initialState);
      setHasChanges(hasFormChanges);
    }
  }, [
    formData,
    sampleProjectFile,
    uploadedProjectFiles,
    uploadedShowFiles,
    showAllFiles,
    selectedTags,
    skillsTags,
    showAudioDescription,
    initialState,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges && canEdit) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges, canEdit]);

  const handleInputChange = useCallback(
    (e, customValue = null) => {
      if (!canEdit) {
        showErrorToast("You are not authorized to edit this project.");
        return;
      }
      if (e?.target) {
        const { name, value } = e.target;
        const isNumberField = ["budget", "video_length", "client_id"].includes(name);
        setFormData((prev) => ({
          ...prev,
          [name]: isNumberField ? (value === "" ? null : parseInt(value, 10)) : value,
        }));
      } else if (typeof e === "string" && customValue !== null) {
        const name = e;
        const value = customValue;
        const isNumberField = ["budget", "video_length", "client_id"].includes(name);
        setFormData((prev) => ({
          ...prev,
          [name]: isNumberField ? (value === "" ? null : parseInt(value, 10)) : value,
        }));
      }
    },
    [canEdit]
  );

  useEffect(() => {
    setShowAudioDescription(Boolean(formData.audio_description && formData.audio_description.trim()));
  }, [formData.audio_description]);

  const handleCheckboxChange = useCallback(
    (checked) => {
      if (!canEdit) {
        showErrorToast("You are not authorized to edit this project.");
        return;
      }
      setShowAudioDescription(checked);

      // Clear audio description if checkbox is unchecked
      if (!checked) {
        setFormData((prev) => ({
          ...prev,
          audio_description: "",
        }));
      }
    },
    [canEdit]
  );


  const handleTagsChange = useCallback(
    (newTags, type) => {
      if (!canEdit) {
        showErrorToast("You are not authorized to edit this project.");
        return;
      }
      if (type === "tags") {
        setSelectedTags(newTags);
        setFormData((prev) => ({ ...prev, tags: newTags }));
      } else if (type === "skills_required") {
        setSkillsTags(newTags);
        setFormData((prev) => ({ ...prev, skills_required: newTags }));
      }
    },
    [canEdit]
  );

  // const handleFileChange = useCallback(
  //   (name) => (files) => {
  //     if (!canEdit) {
  //       showErrorToast("You are not authorized to edit this project.");
  //       return;
  //     }
  //     if (name === "sample_project_file") {
  //       const fileData = files.find((f) => f.isValid);
  //       setSampleProjectFile(fileData ? { file: fileData.file, fileUrl: fileData.fileUrl } : null);
  //       setFormData((prev) => ({
  //         ...prev,
  //         [name]: fileData ? [{ filename: fileData.fileName, url: fileData.fileUrl }] : [],
  //       }));
  //     } else {
  //       const validFiles = files.filter((f) => f?.isValid && f?.fileUrl);
  //       const hasUploading = files.some((f) => f?.uploading);
  //       setIsUploading((prev) => prev || hasUploading);
  //       const fileObjects = validFiles.map((f) => ({
  //         filename: f.fileName || f.fileUrl.split("/").pop(),
  //         url: f.fileUrl,
  //       }));
  //       if (name === "project_files") {
  //         setUploadedProjectFiles(validFiles);
  //         setFormData((prev) => ({ ...prev, [name]: fileObjects }));
  //       } else if (name === "show_all_files") {
  //         setUploadedShowFiles(validFiles);
  //         setFormData((prev) => ({ ...prev, [name]: fileObjects }));
  //       }
  //       if (
  //         !hasUploading &&
  //         !uploadedProjectFiles.some((f) => f?.uploading) &&
  //         !uploadedShowFiles.some((f) => f?.uploading)
  //       ) {
  //         setIsUploading(false);
  //       }
  //     }
  //   },
  //   [canEdit, uploadedProjectFiles, uploadedShowFiles]
  // );

  const handleDateChange = useCallback(
    (date) => {
      if (!canEdit) {
        showErrorToast("You are not authorized to edit this project.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        deadline: date ? date.toISOString().split("T")[0] : null,
      }));
    },
    [canEdit]
  );

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await makeGetRequest("tags/geteventtags");
        const fetchedTags = response.data?.data || [];
        const tagNames = fetchedTags.map((tag) => tag.tag_name) || ["default-tag"];
        setAvailableTags(tagNames);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        setAvailableTags(["default-tag"]);
      }
    };

    const fetchSkills = async () => {
      try {
        const response = await makeGetRequest("tags/getallskill");
        const fetchedSkills = response.data?.data || [];
        const skillNames =
          Array.isArray(fetchedSkills) && fetchedSkills.length > 0
            ? fetchedSkills.map((tag) => tag.tag_name || tag.name || tag.toString())
            : ["default-skill"];
        setAvailableSkills(skillNames);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
        setAvailableSkills(["default-skill"]);
      }
    };

    fetchTags();
    fetchSkills();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canEdit) {
      showErrorToast("You are not authorized to edit this project.");
      return;
    }

    if (!hasChanges) {
      showErrorToast("No changes made to update.");
      return;
    }

    const user = getLoggedInUser();
    if (!user?.user_id) {
      showErrorToast("User not authenticated.");
      return;
    }

    const selectedCategoryOpt = availableCategories.find(
      (opt) => opt.value === formData.project_category
    );
    const projectCategoryName = selectedCategoryOpt ? selectedCategoryOpt.label : "";

    const payload = {
      projects_task_id: parseInt(id, 10),
      client_id: formData.client_id,
      project_title: formData.project_title,
      project_category: projectCategoryName,
      deadline: formData.deadline,
      project_description: formData.project_description,
      budget: formData.budget,
      tags: JSON.stringify(selectedTags),
      skills_required: JSON.stringify(
        skillsTags.map(s => (typeof s === "string" ? s : s.skill_name))
      ),
      reference_links: JSON.stringify(formData.reference_links ? [formData.reference_links] : []),
      additional_notes: formData.additional_notes,
      projects_type: formData.projects_type,
      project_format: formData.project_format,
      audio_voiceover: formData.audio_voiceover,
      audio_description: formData.audio_description,
      video_length: formData.video_length,
      preferred_video_style: formData.preferred_video_style,
      sample_project_file: JSON.stringify(formData.sample_project_file || []),
      project_files: JSON.stringify(
        uploadedProjectFiles.map((file) => ({
          filename: file.file.name,
          url: file.fileUrl,
        }))
      ),
      show_all_files: formData.show_all_files,
      is_active: parseInt(formData.is_active, 10),
      created_by: parseInt(formData.created_by || user.user_id, 10),
      updated_by: parseInt(user.user_id, 10),
      url: formData.url,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
    };

    try {
      await makePutRequest(`projectsTask/updateprojects_taskbyid`, payload);
      showSuccessToast("🎉 Project updated successfully!");
      setHasChanges(false);
      navigate("/projectmanagement");
    } catch (err) {
      console.error("Update error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      showErrorToast(err.response?.data?.message || "Failed to update project.");
    }
  };

  const handleDelete = () => {
    const user = getLoggedInUser();
    if (!user || !user.user_id) {
      showErrorToast("User not authenticated.");
      return;
    }
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      showErrorToast("No valid session found. Please log in.");
      navigate("/login");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        showErrorToast("Session expired. Please log in again.");
        navigate("/login");
        return;
      }
    } catch (error) {
      showErrorToast("Invalid token. Please log in again.");
      navigate("/login");
      return;
    }

    const projectId = parseInt(id, 10);
    if (!projectId || isNaN(projectId)) {
      showErrorToast("Invalid project ID.");
      return;
    }
    const userId = parseInt(user.user_id, 10);
    if (!userId || isNaN(userId)) {
      showErrorToast("Invalid user ID.");
      return;
    }

    const payload = {
      projects_task_id: projectId,
      is_active: 0,
      is_deleted: true,
      deleted_by: userId,
      deleted_at: new Date().toISOString(),
    };

    showAlert({
      title: "Are you sure?",
      text: "This action will permanently delete the project.",
      icon: "warning",
      confirmButton: {
        text: "Yes, Delete",
        backgroundColor: "#372d80",
        textColor: "#fff",
      },
      cancelButton: {
        text: "Cancel",
        backgroundColor: "#c0392b",
        textColor: "#fff",
      },
      onConfirm: async () => {
        try {
          await makePostRequest(`projectsTask/deleteprojects_taskbyid`, payload);
          showSuccessToast("Project deleted successfully!");
          navigate("/projectmanagement");
        } catch (error) {
          console.error("Error deleting project:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            config: error.config,
          });
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to delete project. Please try again.";
          showErrorToast(errorMessage);
        }
      },
      onCancel: () => {
        console.log("Delete cancelled");
      },
    });
  };

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const payload = {
          projects_task_id: parseInt(id, 10)
        };
        const response = await makePostRequest("applications/projects/get-applications", payload);
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        setApplicationaData(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
        showErrorToast("Failed to load application data.");
        setApplicationaData([]);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchApplicationData();
    } else {
      showErrorToast("Please log in to view applications.");
      navigate("/login");
    }
  }, [navigate, id]);

  const Applications = [
    {
      headname: "Application ID",
      dbcol: "applied_projects_id",
      type: "",
    },
    {
      headname: "Name",
      dbcol: "first_name",
      type: "",
    },
    {
      headname: "Status",
      dbcol: "status",
      type: "badge",
    },
    {
      headname: "Skills",
      dbcol: "skill",
      type: "tags",
    },
  ];

  // const handleViewChange = () => {
  //   if (viewMode === "form" && hasChanges && canEdit) {
  //     showAlert({
  //       title: "Unsaved Changes",
  //       text: "You have unsaved changes. Do you want to save them before viewing applications?",
  //       icon: "warning",
  //       confirmButton: {
  //         text: "Save & View",
  //         backgroundColor: "#372d80",
  //         textColor: "#fff",
  //       },
  //       cancelButton: {
  //         text: "Discard",
  //         backgroundColor: "#c0392b",
  //         textColor: "#fff",
  //       },
  //       denyButton: {
  //         text: "Cancel",
  //         backgroundColor: "#2c333a",
  //         textColor: "#fff",
  //       },
  //       onConfirm: async () => {
  //         await handleSubmit(new Event("submit"));
  //         setViewMode("table");
  //       },
  //       onCancel: () => {
  //         setHasChanges(false);
  //         setViewMode("table");
  //       },
  //     });
  //   } else {
  //     setViewMode(viewMode === "form" ? "table" : "form");
  //   }
  // };

  const handleBackNavigation = () => {
    if (hasChanges && canEdit) {
      showAlert({
        title: "Unsaved Changes",
        text: "You have unsaved changes. Do you want to save them before leaving?",
        icon: "warning",
        confirmButton: {
          text: "Save & Leave",
          backgroundColor: "#372d80",
          textColor: "#fff",
        },
        cancelButton: {
          text: "Discard",
          backgroundColor: "#c0392b",
          textColor: "#fff",
        },
        denyButton: {
          text: "Cancel",
          backgroundColor: "#2c333a",
          textColor: "#fff",
        },
        onConfirm: async () => {
          await handleSubmit(new Event("submit"));
        },
        onCancel: () => {
          setHasChanges(false);
          navigate("/projectmanagement");
        },
      });
    } else {
      navigate("/projectmanagement");
    }
  };

  const activeOptions = [
    { value: "0", label: "Inactive" },
    { value: "1", label: "Active" },
    { value: "2", label: "Archived" },
  ];

  const audioVoiceoverOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  if (loading) {
    return (
      <Layout>
        <div>Loading project data...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit}>
        <FormHeader
          title={viewMode === "form" ? "Edit Project" : "Applications"}
          showUpdate={hasChanges && canEdit && viewMode === "form"}
          // onApplications={handleViewChange}
          // applicationsBtnStyle="col col-md-3"
          // applicationsClassName="a-btn-primary"
          showDelete={canEdit && viewMode === "form"}
          backUrl="/projectmanagement"
          onBack={handleBackNavigation}
          onDelete={handleDelete}
        // applicationsBtnText={viewMode === "form" ? "Applications" : "Back to Project"}
        />

        {viewMode === "table" ? (
          <div className="mt-4">
            <DataTable
              id="applications-table"
              columns={Applications}
              tableRef={tableRef}
              data={ApplicationaData}
              keyField="applied_projects_id"
              defaultView="table"
              searchable={true}
              filterable={true}
              sortable={true}
              paginated={true}
              showCheckbox={false}
              grid={false}
            />
          </div>
        ) : (
          <Row>
            <Col md={7}>
              <div className="form_section">
                <h6 className="card-title">Project Details</h6>
                <SelectComponent
                  label="Client Name"
                  name="client_id"
                  options={clients}
                  value={formData.client_id}
                  onChange={() => { }}
                  readOnly
                  placeholder="Select a client"
                  required
                  disabled={!canEdit}
                />
                <TextInput
                  label="Project Title"
                  name="project_title"
                  placeholder="Type project title here"
                  value={formData.project_title || ""}
                  onChange={handleInputChange}
                  required
                  disabled={!canEdit}
                />
                <Aetextarea
                  label="Project Description"
                  name="project_description"
                  placeholder="Type description here"
                  value={formData.project_description || ""}
                  onChange={handleInputChange}
                  required
                  disabled={!canEdit}
                />
                <TextInput
                  label="Preferred Video Style"
                  name="preferred_video_style"
                  placeholder="Type preferred video style"
                  value={formData.preferred_video_style || ""}
                  onChange={handleInputChange}
                  required
                  disabled={!canEdit}
                />
                <SelectComponent
                  label="Audio Voiceover"
                  name="audio_voiceover"
                  options={audioVoiceoverOptions}
                  value={formData.audio_voiceover || "No"}
                  onChange={(value) => handleInputChange("audio_voiceover", value)}
                  required
                  disabled={!canEdit}
                />

                {formData.audio_voiceover === "Yes" || formData.audio_description ? (
                  <>
                    <CheckboxInput
                      label="Add Audio Description"
                      name="audio_description_checkbox"
                      checked={!!formData.audio_description} // checked if description exists
                      onChange={(isChecked) => {
                        if (!canEdit) return;

                        setFormData((prev) => ({
                          ...prev,
                          audio_description: isChecked ? prev.audio_description || "" : "", // clear description if unchecked
                          audio_voiceover: isChecked ? "Yes" : "No", // update voiceover status automatically
                        }));
                      }}
                      disabled={!canEdit}
                    />

                    {formData.audio_description && (
                      <TextInput
                        label="Audio Description"
                        name="audio_description"
                        placeholder="Type audio description"
                        value={formData.audio_description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            audio_description: e.target.value,
                            audio_voiceover: e.target.value ? "Yes" : "No", // keep sync
                          }))
                        }
                        required={!!formData.audio_description}
                        disabled={!canEdit}
                      />
                    )}
                  </>
                ) : null}


                <Aetextarea
                  label="Additional Notes"
                  name="additional_notes"
                  placeholder="Type additional notes"
                  value={formData.additional_notes || ""}
                  onChange={handleInputChange}
                  disabled={!canEdit}
                />
              </div>
              <div className="form_section">
                <h6 className="card-title">SEO</h6>
                <TextInput
                  label="Project URL"
                  name="url"
                  placeholder="Auto-generated from title"
                  value={formData.url || ""}
                  onChange={handleInputChange}
                  onFocus={markTouched("url")}
                  disabled={!canEdit}
                />

                <TextInput
                  label="Meta Title"
                  name="meta_title"
                  placeholder="Auto-generated from title"
                  value={formData.meta_title || ""}
                  onChange={handleInputChange}
                  onFocus={markTouched("meta_title")}
                  disabled={!canEdit}
                />

                <Aetextarea
                  label="Meta Description"
                  name="meta_description"
                  placeholder="Auto-generated from description"
                  value={formData.meta_description || ""}
                  onChange={handleInputChange}
                  onFocus={markTouched("meta_description")}
                  disabled={!canEdit}
                />
              </div>
            </Col>
            <Col md={5}>
              <div className="form_section">
                <h6 className="card-title">Project Settings</h6>
                <SelectComponent
                  label="Status"
                  name="is_active"
                  placeholder="Select status"
                  options={activeOptions}
                  value={formData.is_active || "0"}
                  onChange={(value) => handleInputChange("is_active", value)}
                  required
                  disabled={!canEdit}
                />
                <TagInput
                  label="Tags"
                  name="tags"
                  availableTags={availableTags}
                  initialTags={selectedTags}
                  onTagsChange={(tags) => handleTagsChange(tags, "tags")}
                  info="Select or add tags"
                  tagTypeFieldName="tag_type"
                  tagTypeValue="events"
                  required
                  disabled={!canEdit}
                />
                <SkillInput
                  selectedSkills={skillsTags}
                  setSelectedSkills={(skills) => handleTagsChange(skills, "skills_required")}
                />

                <Aetextarea
                  label="Reference Links"
                  name="reference_links"
                  placeholder="Type reference links or notes here"
                  value={formData.reference_links || ""}
                  onChange={handleInputChange}
                  disabled={!canEdit}
                />
                <DateInput
                  label="deadline"
                  name="deadline"
                  type="future"
                  value={formData.deadline}
                  includeTime={false}
                  onDateChange={handleDateChange}
                  initialDate={formData.deadline ? new Date(formData.deadline) : null}
                  required
                  disabled={!canEdit}
                />
                <CategoryInput
                  value={formData.project_category}
                  onChange={(val) => handleInputChange("project_category", val)}
                  availableCategories={availableCategories}
                  label="Project Category"
                  placeholder="Select a category"
                  onCategoryAdded={(newCategory) => {
                    const newOption = {
                      value: newCategory.category_id,
                      label: newCategory.name || newCategory.category_name,
                    };
                    setAvailableCategory((prev) => [...prev, newOption]);
                  }}
                />

                <TextInput
                  label="Project Type"
                  name="projects_type"
                  placeholder="Type project type"
                  value={formData.projects_type || ""}
                  onChange={handleInputChange}
                  required
                  disabled={!canEdit}
                />
                <TextInput
                  label="Project Format"
                  name="project_format"
                  placeholder="Type project format"
                  value={formData.project_format || ""}
                  onChange={handleInputChange}
                  required
                  disabled={!canEdit}
                />
                <NumberInputComponent
                  label="budget"
                  name="budget"
                  placeholder="Type budget"
                  value={formData.budget || ""}
                  onChange={handleInputChange}
                  min={1}
                  required
                  disabled={!canEdit}
                />
                <NumberInputComponent
                  label="Video Length in Min"
                  name="video_length"
                  placeholder="Type video length (minutes)"
                  value={formData.video_length || ""}
                  onChange={handleInputChange}
                  min={1}
                  required
                  disabled={!canEdit}
                />
              </div>
            </Col>
          </Row>
        )}
      </form>
    </Layout>
  );
};

export default EditProject;