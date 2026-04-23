<template>
  <UserLayout page-title="Employee Profile" page-sub="Manage your personal and professional details">


    <div>
      <!-- ✅ MILESTONE PROGRESS BAR -->
      <div class="milestone-wrapper">
        <div class="milestone-track-bg"></div>
        <div class="milestone-track-fill" :style="{ width: fillWidth }"></div>
        <div class="milestone-steps">
          <div
            v-for="(ms, i) in milestones"
            :key="i"
            class="ms"
            :class="{ done: i < currentStep, active: i === currentStep }"
          >
            <div class="ms-dot">
              <svg v-if="i < currentStep" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7l3 3 6-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="ms-label">{{ ms }}</span>
          </div>
        </div>
      </div>

      <!-- ✅ STEP 1 — PERSONAL DETAILS -->
      <div v-if="currentStep === 0" class="form-card">
        <div class="card-title">Personal Details</div>
        <div class="form-grid">

          

          <div class="form-group">
            <label>Date of Birth <span class="req">*</span></label>
            <input type="date" v-model="profile.dob" :class="{ error: errors.dob }" />
            <span class="err-msg" v-if="errors.dob">Date of birth is required</span>
          </div>

          <div class="form-group">
            <label>Nationality <span class="req">*</span></label>
            <input v-model="profile.nationality" :class="{ error: errors.nationality }" placeholder="e.g. Indian" />
            <span class="err-msg" v-if="errors.nationality">Nationality is required</span>
          </div>



          <div class="form-group">
            <label>Blood Group <span class="req">*</span></label>
            <input v-model="profile.blood" :class="{ error: errors.blood }" placeholder="e.g. B+" />
            <span class="err-msg" v-if="errors.blood">Blood group is required</span>
          </div>

          <div class="form-group">
            <label>Marital Status</label>
            <input v-model="profile.maritalStatus" placeholder="Single / Married" />
        </div>

        <div class="form-group">
  <label>Profile Photo URL</label>
  <input
    v-model="profile.profilePhotoUrl"
    placeholder="Enter image URL"
  />
</div>


        <div class="form-group">
          <label>Emergency Contact Name</label>
          <input v-model="profile.emergencyName" />
        </div>

        <div class="form-group">
          <label>Emergency Contact Relation</label>
          <input v-model="profile.emergencyRelation" />
        </div>

       <div class="form-group">
        <label>Emergency Contact Phone <span class="req">*</span></label>
        <input
          v-model="profile.emergencyPhone"
          :class="{ error: errors.emergencyPhone }"
          maxlength="20"
          placeholder="+91 XXXXXXXXXX"
        />
        <span class="err-msg" v-if="errors.emergencyPhone">
          Emergency contact phone is required
        </span>
      </div>

        </div>
        <div class="nav-row">
          <div></div>
          <div class="nav-actions">
            <button class="btn-edit-secondary" @click="editProfile">Edit</button>
            <button class="btn-next" @click="handlePersonalNext">
              Next →
            </button>
          </div>
        </div>
      </div>


      <!-- ✅ STEP 2 — ADDRESS DETAILS -->
<div v-if="currentStep === 1" class="form-card">
  <div class="card-title">Address Details</div>

  <!-- 🔹 CURRENT ADDRESS -->
   <div class="sub-card">
  <div class="sub-card-title">Current Address</div>
  <div class="form-grid">

    <div class="form-group">
      <label>Address Type</label>
      <input v-model="profile.addressType" placeholder="Current / Permanent" />
    </div>

    <div class="form-group full">
      <label><h4>Address Line 1 <span class="req">*</span></h4></label>
      <input v-model="profile.address" :class="{ error: errors.address }" placeholder="House / Flat no., Street, Area" />
      <span class="err-msg" v-if="errors.address">Address is required</span>
    </div>

    <div class="form-group full">
      <label>Address Line 2</label>
      <input v-model="profile.address2" placeholder="Optional" />
    </div>

    <div class="form-group">
      <label>Landmark</label>
      <input v-model="profile.landmark" />
    </div>

    <div class="form-group">
      <label>City <span class="req">*</span></label>
      <input v-model="profile.city" :class="{ error: errors.city }" placeholder="e.g. Nashik" />
      <span class="err-msg" v-if="errors.city">City is required</span>
    </div>

    <div class="form-group">
      <label>State <span class="req">*</span></label>
      <input v-model="profile.state" :class="{ error: errors.state }" placeholder="e.g. Maharashtra" />
      <span class="err-msg" v-if="errors.state">State is required</span>
    </div>

    <div class="form-group">
      <label>Country</label>
      <input v-model="profile.country" placeholder="e.g. India" />
    </div>

    <div class="form-group">
      <label>Pincode <span class="req">*</span></label>
      <input v-model="profile.pincode" :class="{ error: errors.pincode }" placeholder="6-digit pincode" maxlength="6" />
      <span class="err-msg" v-if="errors.pincode">Valid 6-digit pincode is required</span>
    </div>

  </div>
  </div>

  <!-- 🔹 PERMANENT ADDRESS -->
  <div class="sub-card" style="margin-top:20px;">
  <div class="perm-header">
  <div class="card-title">Permanent Address</div>

  <label class="checkbox-label">
    <input type="checkbox" v-model="profile.sameAsCurrent" />
    <span>Same as Current</span>
  </label>
</div>

  <div class="form-grid">

    <div class="form-group full">
      <label><h4>Address Line 1<span class="req">*</span></h4></label>
      <input v-model="profile.permAddress" placeholder="House / Flat no., Street, Area" />
    </div>

    <div class="form-group full">
      <label>Address Line 2</label>
      <input v-model="profile.permAddress2" placeholder="Optional" />
    </div>

   <div class="form-group">
    <label>Landmark</label>
    <input v-model="profile.permLandmark" :disabled="profile.sameAsCurrent" />
  </div>

    <div class="form-group">
      <label><h4>City<span class="req">*</span></h4></label>
      <input v-model="profile.permCity" />
    </div>

    <div class="form-group">
      <label><h4>State<span class="req">*</span></h4></label>
      <input v-model="profile.permState" />
    </div>

    <div class="form-group">
      <label>Country</label>
      <input v-model="profile.permCountry" />
    </div>

    <div class="form-group">
      <label><h4>Pincode<span class="req">*</span></h4></label>
      <input v-model="profile.permPincode" />
    </div>

  </div>
</div>

  <div class="nav-row">
    <button class="btn-prev" @click="prev">&#8592; Back</button>
    <div class="nav-actions">
      <button class="btn-edit-secondary" @click="editProfile">Edit</button>
      <button class="btn-next" @click="handleAddressNext">Next &rarr;</button>
    </div>
  </div>
</div>


<!-- ✅ STEP 3 — EDUCATION -->
<div v-if="currentStep === 2" class="form-card">
  <div class="card-title">Education</div>
  <div class="form-grid">

    <div class="form-group">
      <label>Degree <span class="req">*</span></label>
      <input v-model="profile.degree" :class="{ error: errors.degree }" placeholder="e.g. B.Tech" />
      <span class="err-msg" v-if="errors.degree">Degree is required</span>
    </div>

    <div class="form-group">
      <label>Field of Study <span class="req">*</span></label>
      <input v-model="profile.field" :class="{ error: errors.field }" placeholder="e.g. Computer Science" />
      <span class="err-msg" v-if="errors.field">Field of study is required</span>
    </div>

    <div class="form-group">
      <label>Specialization</label>
      <input v-model="profile.specialization" placeholder="e.g. AI / Data Science" />
    </div>

    <div class="form-group">
      <label>Institution <span class="req">*</span></label>
      <input v-model="profile.institution" :class="{ error: errors.institution }" placeholder="College name" />
      <span class="err-msg" v-if="errors.institution">Institution is required</span>
    </div>

    <div class="form-group">
      <label>University / Board</label>
      <input v-model="profile.university" placeholder="e.g. Mumbai University" />
    </div>

    <div class="form-group">
      <label>Start Year</label>
      <input v-model="profile.startYear" placeholder="e.g. 2018" maxlength="4" />
    </div>

    <div class="form-group">
      <label>Year of Passing <span class="req">*</span></label>
      <input v-model="profile.year" :class="{ error: errors.year }" placeholder="e.g. 2022" maxlength="4" />
      <span class="err-msg" v-if="errors.year">Year is required</span>
    </div>

    <div class="form-group">
      <label>Grading System</label>
      <input v-model="profile.gradingSystem" placeholder="CGPA / Percentage" />
    </div>

    <div class="form-group">
      <label>CGPA / Percentage</label>
      <input v-model="profile.cgpa" placeholder="e.g. 8.4 / 78%" />
    </div>

    
      <div class="form-group">
  <label>Highest Qualification <span class="req">*</span></label>
  <select v-model="profile.highestQualification" class="select-box">
    <option disabled value="">Select Qualification</option>
    <option>BCA</option>
    <option>MCA</option>
    <option>B.Tech</option>
    <option>M.Tech</option>
    <option>BSc</option>
    <option>MSc</option>
    <option>BBA</option>
    <option>MBA</option>
    <option>PhD</option>
    <option>Diploma</option>
    <option>Other</option>
  </select>
</div>

<div class="form-group full">
  <label>Certificate URL</label>

  <input
    v-model="profile.certificateUrl"
    :class="{ error: errors.certificateUrl }"
    placeholder="Paste scanned certificate link"
  />

  <span class="err-msg" v-if="errors.certificateUrl">
    Enter valid URL (http/https)
  </span>
  </div>
    </div>


  <div class="nav-row">
    <button class="btn-prev" @click="prev">&#8592; Back</button>
    <div class="nav-actions">
      <button class="btn-edit-secondary" @click="editProfile">Edit</button>
      <button class="btn-next" @click="handleEducationNext">Next &rarr;</button>
    </div>
  </div>
</div>


    <!-- ✅ STEP 4 — PREVIOUS EMPLOYMENT -->
<div v-if="currentStep === 3" class="form-card">
  <div class="card-title">Previous Employment</div>
  <div class="form-grid">

    <div class="form-group">
      <label>Company Name <span class="req">*</span></label>
      <input v-model="profile.company" :class="{ error: errors.company }" placeholder="Previous employer" />
      <span class="err-msg" v-if="errors.company">Company name is required</span>
    </div>

    <div class="form-group">
      <label>Role / Designation <span class="req">*</span></label>
      <input v-model="profile.role" :class="{ error: errors.role }" placeholder="e.g. Software Engineer" />
      <span class="err-msg" v-if="errors.role">Role is required</span>
    </div>

    <div class="form-group">
      <label>Employment Type</label>
      <input v-model="profile.employmentType" placeholder="Full-time / Intern / Contract" />
    </div>

    <div class="form-group">
      <label>Start Date <span class="req">*</span></label>
      <input type="date" v-model="profile.start" :class="{ error: errors.start }" />
      <span class="err-msg" v-if="errors.start">Start date is required</span>
    </div>

    <div class="form-group">
      <label>End Date <span class="req">*</span></label>
      <input type="date" v-model="profile.end" :class="{ error: errors.end }" />
      <span class="err-msg" v-if="errors.end">End date is required</span>
    </div>

    <div class="form-group">
      <label>Last Drawn CTC</label>
      <input v-model="profile.lastDrawnCTC" placeholder="e.g. 5,00,000" />
    </div>

    <div class="form-group">
      <label>Currency</label>
      <input v-model="profile.currency" placeholder="INR / USD" />
    </div>

    <div class="form-group">
      <label>Reason for Leaving</label>
      <input v-model="profile.leavingReason" placeholder="Optional" />
    </div>


    <!-- 🔹 DOCUMENT LINKS -->
<div class="form-group ">
  <label>Relieving Letter URL</label>
  <input
    v-model="profile.relievingLetterUrl"
    placeholder="Paste relieving letter link"
  />
</div>

<div class="form-group">
  <label>Experience Letter URL</label>
  <input
    v-model="profile.experienceLetterUrl"
    placeholder="Paste experience letter link"
  />
</div>

<!-- 🔹 HR VERIFICATION -->
<div class="form-group">
  <label>Verified</label>
  <select v-model="profile.empVerified" class="small-select">
    <option :value="false">No</option>
    <option :value="true">Yes</option>
  </select>
</div>

<div class="form-group">
  <label>Verified By (HR ID)</label>
  <input v-model="profile.verifiedBy" placeholder="HR Employee ID" />
</div>

<div class="form-group">
  <label>Verified At</label>
  <input type="datetime-local" v-model="profile.verifiedAt" />
</div>

  </div>

  <div class="nav-row">
    <button class="btn-prev" @click="prev">&#8592; Back</button>
    <button class="btn-next" @click="handleEmploymentNext">Next &rarr;</button>
  </div>
</div>


    <!-- ✅ STEP 5 — IDENTITY DETAILS -->
<div v-if="currentStep === 4" class="form-card">
  <div class="card-title">Identity Details</div>
  <div class="form-grid">

    <div class="form-group">
      <label>Identity Type <span class="req">*</span></label>
      <select v-model="profile.identityType" class="small-select">
        <option disabled value="">Select</option>
        <option>Aadhaar</option>
        <option>PAN</option>
        <option>Passport</option>
      </select>
    </div>

    <div class="form-group">
      <label>Identity Number <span class="req">*</span></label>
      <input v-model="profile.identityNumber" />
    </div>

    <div class="form-group">
      <label>Name on Document</label>
      <input v-model="profile.nameOnDocument" />
    </div>

    <div class="form-group">
      <label>Issued By</label>
      <input v-model="profile.issuedBy" />
    </div>

    <div class="form-group">
      <label>Issue Date</label>
      <input type="date" v-model="profile.issueDate" />
    </div>

    <div class="form-group">
      <label>Expiry Date</label>
      <input type="date" v-model="profile.expiryDate" />
    </div>

    <div class="form-group ">
      <label>Document URL</label>
      <input v-model="profile.documentUrl" />
    </div>

    <div class="form-group">
      <label>Verified</label>
      <select v-model="profile.identityVerified" class="small-select">
        <option :value="false">No</option>
        <option :value="true">Yes</option>
      </select>
    </div>

  </div>

  <div class="nav-row">
    <button class="btn-prev" @click="prev">&#8592; Back</button>
    <div class="nav-actions">
      <button class="btn-edit-secondary" @click="editProfile">Edit</button>
      <button class="btn-next" @click="handleIdentityNext">Next →</button>
    </div>
  </div>
</div>


    <!-- ✅ STEP 6 — DOCUMENTS -->
<div v-if="currentStep === 5" class="form-card">
  <div class="card-title">Documents</div>

  <div class="form-grid">

    <div class="form-group">
      <label>Document Type <span class="req">*</span></label>
      <select v-model="profile.docType" class="small-select">
        <option disabled value="">Select</option>
        <option>Aadhaar</option>
        <option>PAN</option>
        <option>Resume</option>
        <option>Certificate</option>
        <option>Experience Letter</option>
      </select>
    </div>

    <div class="form-group">
      <label>File Name <span class="req">*</span></label>
      <input v-model="profile.fileName" placeholder="Original file name" />
    </div>

        <div class="form-group doc-preview">
      <label>File URL <span class="req">*</span></label>

      <div class="input-with-icon">
        <input
          v-model="profile.fileUrl"
          placeholder="S3 / storage link"
        />

        <!-- 👁️ Eye icon -->
        <span
          class="eye-icon"
          v-if="profile.fileUrl"
          @click="previewDoc(profile.fileUrl)"
          title="View Document"
        >
          👁️
        </span>
      </div>
    </div>

    <div class="form-group">
      <label>File Size (KB)</label>
      <input v-model="profile.fileSizeKb" type="number" />
    </div>

    <div class="form-group">
      <label>MIME Type</label>
      <input v-model="profile.mimeType" placeholder="application/pdf" />
    </div>

    <div class="form-group ">
      <label>Description</label>
      <input v-model="profile.description" placeholder="Optional notes" />
    </div>

    <div class="form-group">
      <label>Is Confidential</label>
      <select v-model="profile.isConfidential" class="small-select">
        <option :value="false">No</option>
        <option :value="true">Yes</option>
      </select>
    </div>

    <div class="form-group">
      <label>Expiry Date</label>
      <input type="date" v-model="profile.docExpiry" />
    </div>

  </div>

  <div class="documents-list" v-if="documents.length > 0">
    <h4>Uploaded Documents</h4>
    <table class="documents-table">
      <thead>
        <tr>
          <th>Document Type</th>
          <th>File Name</th>
          <th>Preview</th>
          <th>File Size</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(doc, index) in documents" :key="index">
          <td data-label="Document Type">{{ doc.docType }}</td>
          <td data-label="File Name">{{ doc.fileName }}</td>
          <td data-label="Preview"><span class="eye-icon" @click="previewDoc(doc.fileUrl)" title="Preview Document">👁️</span></td>
          <td data-label="File Size">{{ doc.fileSizeKb }} KB</td>
          <td data-label="Actions"><button class="btn-delete" @click="deleteDocument(index)">Delete</button></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="nav-row">
    <button class="btn-prev" @click="prev">← Back</button>
    <div class="nav-actions">
      <button class="btn-add" @click="addDocument">Add Document</button>
      <button class="btn-edit-secondary" @click="editProfile">Edit</button>
      <button class="btn-save" @click="saveProfile">Save Profile</button>
    </div>
  </div>
</div>


    <!-- ✅ SUCCESS STATE -->
    <div v-if="currentStep === 6" class="success-card">
      <div class="success-icon">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="16" fill="#2e7d32"/>
          <path d="M10 18.5l6 6 10-10" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>Profile Saved Successfully!</h3>
      <p>All your details have been saved. You can edit them anytime.</p>
      <button class="btn-edit" @click="editProfile">Edit Profile</button>
    </div>

  </div>

  </UserLayout>
</template>

<script>
import UserLayout from '../../components/UserLayout.vue'

export default {
  components: { UserLayout },

  data() {
    return {
      currentStep: 0,
      milestones: ['Personal', 'Address', 'Education', 'Employment', 'Identity', 'Documents'],
      errors: {},
      documents: [],

      profile: {
        dob: '',
        nationality: '',
        blood: '',
        maritalStatus: '',
        profilePhotoUrl: '',
        emergencyName: '',
        emergencyRelation: '',
        emergencyPhone: '',

        address: '',
        address2: '',
        city: '',
        state: '',
        country: '',
        pincode: '',

        degree: '',
        field: '',
        institution: '',
        startYear: '',
        year: '',
        cgpa: '',

        company: '',
        role: '',
        start: '',
        end: '',
        leavingReason: '',

        identityNumber: '',
        expiryDate: '',

        fileName: '',
        fileUrl: '',
        fileSizeKb: '',
        mimeType: '',
        description: ''
      }
    }
  },

  computed: {
    fillWidth() {
      return `${(this.currentStep / (this.milestones.length - 1)) * 100}%`
    }
  },

  methods: {

    // ================= COMMON =================
    getToken() {
      return sessionStorage.getItem('hrms_token') || localStorage.getItem('hrms_token')
    },

    getEmployeeCode() {
      const code = sessionStorage.getItem('employeeCode')

      if (!code || code === "null" || code === "") {
        console.warn("⚠️ Employee code missing")
        return null
      }

      return code
    },

    prev() {
      this.currentStep--
    },

    validateStep(step) {
      this.errors = {}
      const p = this.profile

      if (step === 0) {
        if (!p.dob) this.errors.dob = true
        if (!p.nationality) this.errors.nationality = true
        if (!p.blood) this.errors.blood = true
        if (!p.emergencyPhone) this.errors.emergencyPhone = true
      }

      return Object.keys(this.errors).length === 0
    },

    // ================= PERSONAL =================
    async handlePersonalNext() {
      if (!this.validateStep(0)) return

      const code = this.getEmployeeCode()
      if (!code) return

      try {
        const res = await fetch(`http://localhost:3000/api/employees/${code}/personal/basic`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getToken()}`
          },
          body: JSON.stringify({
            dateOfBirth: this.profile.dob,
            maritalStatusLkpId: this.profile.maritalStatus ? 1 : null,
            bloodGroupLkpId: this.profile.blood ? 1 : null,
            profilePhotoUrl: this.profile.profilePhotoUrl,
            nationality: this.profile.nationality,
            emergencyContactName: this.profile.emergencyName,
            emergencyContactPhone: this.profile.emergencyPhone,
            emergencyRelation: this.profile.emergencyRelation
          })
        })

        const data = await res.json()
        console.log("PERSONAL:", data)

        if (!res.ok) return alert(data.error)

        this.currentStep++

      } catch (err) {
        console.error(err)
      }
    },

    // ================= ADDRESS =================
    async handleAddressNext() {
      const code = this.getEmployeeCode()
      if (!code) return

      try {
        const res = await fetch(`http://localhost:3000/api/employees/${code}/address`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getToken()}`
          },
          body: JSON.stringify({
            addressTypeLkpId: 1,
            line1: this.profile.address,
            line2: this.profile.address2,
            cityId: 1,
            stateId: 1,
            pincode: this.profile.pincode,
            countryCode: "IN"
          })
        })

        const data = await res.json()
        console.log("ADDRESS:", data)

        if (!res.ok) return alert(data.error)

        this.currentStep++

      } catch (err) {
        console.error(err)
      }
    },

    // ================= EDUCATION =================
    async handleEducationNext() {
      const code = this.getEmployeeCode()
      if (!code) return

      try {
        const res = await fetch(`http://localhost:3000/api/employees/${code}/education`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getToken()}`
          },
          body: JSON.stringify({
            degree: this.profile.degree,
            institution: this.profile.institution,
            fieldOfStudy: this.profile.field,
            startYear: Number(this.profile.startYear),
            endYear: Number(this.profile.year),
            grade: this.profile.cgpa,
            isHighest: true
          })
        })

        const data = await res.json()
        console.log("EDUCATION:", data)

        if (!res.ok) return alert(data.error)

        this.currentStep++

      } catch (err) {
        console.error(err)
      }
    },

    // ================= EMPLOYMENT =================
    async handleEmploymentNext() {
      const code = this.getEmployeeCode()
      if (!code) return

      try {
        const res = await fetch(`http://localhost:3000/api/employees/${code}/previous-employment`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getToken()}`
          },
          body: JSON.stringify({
            companyName: this.profile.company,
            designation: this.profile.role,
            startDate: this.profile.start,
            endDate: this.profile.end,
            reasonForLeaving: this.profile.leavingReason
          })
        })

        const data = await res.json()
        console.log("EMPLOYMENT:", data)

        if (!res.ok) return alert(data.error)

        this.currentStep++

      } catch (err) {
        console.error(err)
      }
    },

    // ================= IDENTITY =================
    async handleIdentityNext() {
      const code = this.getEmployeeCode()
      if (!code) return

      try {
        const res = await fetch(`http://localhost:3000/api/employees/${code}/identity`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getToken()}`
          },
          body: JSON.stringify({
            identityTypeLkpId: 1,
            identityNumber: this.profile.identityNumber,
            expiryDate: this.profile.expiryDate || null
          })
        })

        const data = await res.json()
        console.log("IDENTITY:", data)

        if (!res.ok) return alert(data.error)

        this.currentStep++

      } catch (err) {
        console.error(err)
      }
    },

    // ================= DOCUMENT =================
    async saveProfile() {
      const code = this.getEmployeeCode()
      if (!code) return

      try {
        const res = await fetch(`http://localhost:3000/api/employees/${code}/document`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getToken()}`
          },
          body: JSON.stringify({
            docTypeLkpId: 1,
            fileName: this.profile.fileName,
            fileUrl: this.profile.fileUrl,
            fileSizeBytes: Number(this.profile.fileSizeKb) * 1024,
            mimeType: this.profile.mimeType,
            description: this.profile.description
          })
        })

        const data = await res.json()
        console.log("DOCUMENT:", data)

        if (!res.ok) return alert(data.error)

        alert("✅ Profile Completed")
        this.currentStep = 6

      } catch (err) {
        console.error(err)
      }
    },

    // ================= UI =================
    addDocument() {
      this.documents.push({ ...this.profile })
    },

    deleteDocument(index) {
      this.documents.splice(index, 1)
    },

    previewDoc(url) {
      window.open(url, "_blank")
    },

    editProfile() {
      this.currentStep = 0
    }
  }
}
</script>

<style scoped>

/* ─── MILESTONE BAR ──────────────────────────────────────────────────────── */
.milestone-wrapper {
  position: relative;
  margin-bottom: 28px;
  padding-top: 8px;
}

.milestone-track-bg {
  position: absolute;
  top: 26px;
  left: 0;
  right: 0;
  height: 3px;
  background: #e2eee5;
  border-radius: 2px;
  z-index: 0;
}

.milestone-track-fill {
  position: absolute;
  top: 26px;
  left: 18px;
  height: 3px;
  background: #2e7d32;
  border-radius: 2px;
  z-index: 1;
  transition: width 0.45s ease;
}

.milestone-steps {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
}

.ms {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.ms-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 2.5px solid #d8e8da;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #9cb8a0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

.ms.active .ms-dot {
  background: #e8f5e9;
  border-color: #2e7d32;
  color: #2e7d32;
  box-shadow: 0 0 0 4px rgba(46,125,50,0.12);
}

.ms.done .ms-dot {
  background: #2e7d32;
  border-color: #2e7d32;
  color: #fff;
}

.ms-label {
  font-size: 11px;
  color: #9cb8a0;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.ms.active .ms-label {
  color: #2e7d32;
  font-weight: 600;
}

.ms.done .ms-label {
  color: #2e7d32;
}

.perm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon input {
  width: 100%;
  padding-right: 40px;
}

.eye-icon {
  cursor: pointer;
  font-size: 18px;
  opacity: 0.7;
  transition: opacity 0.2s, transform 0.2s;
}

.input-with-icon .eye-icon {
  position: absolute;
  right: 10px;
}

.eye-icon:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* ─── FORM CARD ──────────────────────────────────────────────────────────── */
.form-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.06);
  padding: 24px 28px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e261f;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e8f0e8;
}


/* 🔥 SUB CARD (Current / Permanent) */
.sub-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 18px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #eef5ef;
}

.sub-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 14px;
}

/* ─── FORM GRID ──────────────────────────────────────────────────────────── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7d6f;
  letter-spacing: 0.2px;
}

.req {
  color: #d32f2f;
  margin-left: 2px;
}

.form-group input {
  height: 40px;
  border-radius: 8px;
  border: 1.5px solid #e2eee5;
  padding: 0 12px;
  font-size: 13px;
  color: #1e261f;
  background: #fafcfa;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46,125,50,0.1);
  background: #fff;
}

.form-group input.error {
  border-color: #e53935;
  background: #fff8f8;
}

.err-msg {
  font-size: 11px;
  color: #e53935;
  margin-top: 2px;
}

.small-select {
  height: 40px;
  font-size: 12px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1.5px solid #e2eee5;
  background: #fafcfa;
}

.select-box {
  height: 40px;
  border-radius: 8px;
  border: 1.5px solid #e2eee5;
  padding: 0 12px;
  font-size: 13px;
  background: #fafcfa;
  color: #1e261f;
  outline: none;
}

.select-box:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46,125,50,0.1);
  background: #fff;
}
/* ─── DOCS GRID ──────────────────────────────────────────────────────────── */
.docs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.doc-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.doc-group label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7d6f;
}

.file-upload {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1.5px dashed #c8deca;
  border-radius: 10px;
  background: #fafcfa;
  transition: border-color 0.2s, background 0.2s;
}

.file-upload:hover {
  border-color: #2e7d32;
  background: #f4faf4;
}

.file-upload.uploaded {
  border-color: #2e7d32;
  border-style: solid;
  background: #f0f9f0;
}

.file-upload.file-error {
  border-color: #e53935;
  background: #fff8f8;
}

.file-upload input {
  display: none;
}

.file-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #2e7d32;
  color: #fff;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.file-btn:hover {
  background: #256427;
}

.file-name {
  font-size: 12px;
  color: #6b7d6f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ─── NAV ROW ────────────────────────────────────────────────────────────── */
.nav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e8f0e8;
}

.btn-next {
  background: #2e7d32;
  color: #fff;
  border: none;
  padding: 10px 26px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn-next:hover { background: #256427; }
.btn-next:active { transform: scale(0.97); }

.btn-prev {
  background: #f4faf4;
  color: #2e7d32;
  border: 1.5px solid #c8deca;
  padding: 10px 22px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-prev:hover { background: #e8f5e9; }

.btn-save {
  background: #1b5e20;
  color: #fff;
  border: none;
  padding: 10px 26px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn-save:hover { background: #163d18; }
.btn-save:active { transform: scale(0.97); }

/* ─── SUCCESS CARD ───────────────────────────────────────────────────────── */
.success-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.06);
  padding: 48px 28px;
  text-align: center;
}

.success-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.success-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1e261f;
  margin-bottom: 8px;
}

.success-card p {
  font-size: 14px;
  color: #6b7d6f;
  margin-bottom: 24px;
}

.btn-edit {
  background: #f4faf4;
  color: #2e7d32;
  border: 1.5px solid #2e7d32;
  padding: 10px 28px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-edit:hover { background: #e8f5e9; }


/* ✅ FIXED CHECKBOX STYLE */
.checkbox-group {
  display: flex;
  align-items: center;
  height: 40px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #1e261f;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #2e7d32;
  cursor: pointer;
}

/* ─── RESPONSIVE ─────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .documents-table {
    font-size: 14px;
  }

  .documents-table th,
  .documents-table td {
    padding: 8px 12px;
  }

  .documents-table {
    overflow-x: auto;
    display: block;
    white-space: nowrap;
  }

  .documents-table thead,
  .documents-table tbody,
  .documents-table th,
  .documents-table td,
  .documents-table tr {
    display: block;
  }

  .documents-table thead tr {
    position: absolute;
    top: -9999px;
    left: -9999px;
  }

  .documents-table tr {
    border: 1px solid #e8f0e8;
    border-radius: 8px;
    margin-bottom: 8px;
    padding: 8px;
  }

  .documents-table td {
    border: none;
    border-bottom: 1px solid #f0f9f0;
    position: relative;
    padding-left: 50%;
    text-align: left;
  }

  .documents-table td:before {
    content: attr(data-label);
    position: absolute;
    left: 8px;
    width: 45%;
    padding-right: 10px;
    white-space: nowrap;
    font-weight: 600;
    color: #6b7d6f;
  }

  .documents-table td:last-child {
    border-bottom: none;
  }
}

@media (max-width: 640px) {
  .form-grid,
  .docs-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full {
    grid-column: 1;
  }

  .ms-label {
    display: none;
  }
}

.nav-actions {
  display: flex;
  gap: 10px;
}

.btn-add {
  background: #2e7d32;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-edit-secondary {
  background: #eef6ee;
  color: #2e7d32;
  border: 1px solid #c8deca;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn-edit-secondary:hover {
  background: #e8f5e9;
}

.btn-add:hover {
  background: #256427;
}

.documents-list {
  margin-top: 20px;
}

.documents-list h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e261f;
  margin-bottom: 10px;
}

.documents-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.documents-table th,
.documents-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #e8f0e8;
}

.documents-table th {
  font-weight: 600;
  color: #1e261f;
  background: #fafcfa;
}


.btn-delete {
  background: #d32f2f;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-delete:hover {
  background: #b71c1c;
}

</style>