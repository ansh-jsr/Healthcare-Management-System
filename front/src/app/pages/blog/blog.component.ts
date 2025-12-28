import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CommonModule } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  tags: string[];
}

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatPaginatorModule,
    NgxSkeletonLoaderModule,
  ],
})
export class BlogComponent implements OnInit {
  posts: BlogPost[] = [];
  loading = true;
  searchTerm = '';
  category = 'all';
  page = 1;
  selectedTabIndex = 0;
  savedArticles: number[] = [];
  postsPerPage = 6;

  categories = [
    'all',
    'Technology',
    'Digital Health',
    'Compliance',
    'Telehealth',
    'Development',
    'Interoperability',
  ];

  // Mock data
  blogData: BlogPost[] = [
  {
    id: 1,
    title: 'Understanding Blockchain in Healthcare: Benefits and Challenges',
    excerpt: 'Blockchain technology offers potential solutions to many healthcare challenges including data security, interoperability, and patient data ownership.',
    content: 'Full article content here...',
    author: 'Dr. Sarah Johnson',
    date: '2023-05-15',
    readTime: '8 min read',
    category: 'Technology',
    image: "https://theonetechnologies.com/posts/files/b2a1ba0a-51ff-4ca3-8c51-ca74310391dc.jpg",
    tags: ['Blockchain', 'Healthcare Technology', 'Data Security'],
  },
  {
    id: 2,
    title: 'The Impact of Medical Records Digitization on Patient Care',
    excerpt: 'Digital transformation in healthcare is revolutionizing how patient data is stored, accessed, and utilized for better care outcomes.',
    content: 'Full article content here...',
    author: 'Dr. Michael Chen',
    date: '2023-05-10',
    readTime: '6 min read',
    category: 'Digital Health',
    image: "https://s3-prod.modernhealthcare.com/s3fs-public/Epic%20digital%20gap.png",
    tags: ['EHR', 'Digital Transformation', 'Patient Care'],
  },
  {
    id: 3,
    title: 'New Privacy Regulations for Patient Data: What You Need to Know',
    excerpt: 'Recent regulatory changes are affecting how healthcare providers must handle, store, and secure patient information.',
    content: 'Full article content here...',
    author: 'Jennifer Williams, JD',
    date: '2023-04-28',
    readTime: '10 min read',
    category: 'Compliance',
    image: "https://www.hipaajournal.com/wp-content/uploads/2024/02/Ten-Steps-to-HIPAA-Compliance.jpg",
    tags: ['HIPAA', 'Privacy', 'Compliance', 'Regulations'],
  },
  {
    id: 4,
    title: 'Telemedicine Adoption Trends in Post-Pandemic Healthcare',
    excerpt: 'As we move beyond the pandemic, telemedicine continues to reshape healthcare delivery. What trends are emerging?',
    content: 'Full article content here...',
    author: 'Dr. Lisa Rodriguez',
    date: '2023-04-20',
    readTime: '7 min read',
    category: 'Telehealth',
    image: "https://ca-times.brightspotcdn.com/dims4/default/6e7c424/2147483647/strip/true/crop/2430x1366+0+0/resize/1200x675!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F19%2F1d%2Fd5614b7049ffa642aaf38cd8dcb6%2Ftelemed-lead-fam-1.jpeg",
    tags: ['Telemedicine', 'Remote Care', 'Healthcare Trends'],
  },
  {
    id: 5,
    title: 'Healthcare App Security: Best Practices for Developers',
    excerpt: 'Developing secure healthcare applications requires specific approaches to protect sensitive patient information.',
    content: 'Full article content here...',
    author: 'Alan Parker, CISSP',
    date: '2023-04-15',
    readTime: '9 min read',
    category: 'Development',
    image: "https://ahex.co/wp-content/uploads/2022/07/Healthcare-mobile-app-development.png",
    tags: ['Security', 'App Development', 'Best Practices'],
  },
  {
    id: 6,
    title: 'The Role of AI in Modern Medical Diagnostics',
    excerpt: 'Artificial intelligence is transforming diagnostic capabilities, offering new tools for healthcare providers.',
    content: 'Full article content here...',
    author: 'Dr. Robert Kim',
    date: '2023-04-08',
    readTime: '8 min read',
    category: 'Technology',
    image: "https://www.impactqa.com/wp-content/uploads/2022/02/Artificial-Intelligence-AI-and-its-Assistance-in-Medical-Diagnosis-Blog.png",
    tags: ['AI', 'Diagnostics', 'Machine Learning'],
  },
  {
    id: 7,
    title: 'Improving Patient Engagement Through Digital Tools',
    excerpt: 'Digital engagement strategies are helping healthcare providers build stronger relationships with patients.',
    content: 'Full article content here...',
    author: 'Emma Thompson, MPH',
    date: '2023-03-30',
    readTime: '6 min read',
    category: 'Digital Health',
    image: "https://smartclinix.net/wp-content/uploads/2025/02/The-Rise-of-Digital-Health-Platforms.webp",
    tags: ['Patient Engagement', 'Digital Health', 'Patient Experience'],
  },
  {
    id: 8,
    title: 'Healthcare Data Integration: Connecting Disparate Systems',
    excerpt: 'Connecting different healthcare systems remains a challenge. What approaches are showing the most promise?',
    content: 'Full article content here...',
    author: 'David Wilson, Health IT Specialist',
    date: '2023-03-22',
    readTime: '9 min read',
    category: 'Interoperability',
    image: "https://www.iso.org/files/live/sites/isoorg/files/news/insights/healthcare/Healthcare_Evergreen%20-%20Electronic%20Health%20Records.svg",
    tags: ['Data Integration', 'Interoperability', 'Healthcare IT'],
  },
  {
    id: 9,
    title: 'The Future of Electronic Health Records',
    excerpt: 'EHR systems continue to evolve. What changes can we expect in the next generation of electronic health records?',
    content: 'Full article content here...',
    author: 'Dr. Patricia Nelson',
    date: '2023-03-15',
    readTime: '7 min read',
    category: 'Digital Health',
    image: "https://miro.medium.com/v2/resize:fit:1200/0*YCPVn0SaCeLG_H1O.png",
    tags: ['EHR', 'Future Technology', 'Health Records'],
  },
  {
    id: 10,
    title: 'Remote Patient Monitoring: Beyond the Basics',
    excerpt: 'Advanced remote monitoring technologies are helping providers extend care beyond traditional settings.',
    content: 'Full article content here...',
    author: 'Dr. James Martin',
    date: '2023-03-08',
    readTime: '8 min read',
    category: 'Telehealth',
    image: "https://wp.healthdatamanagement.com/wp-content/uploads/2021/08/telehealth-pic.jpg",
    tags: ['Remote Monitoring', 'IoT', 'Patient Care'],
  },
  {
    id: 11,
    title: 'Building a Culture of Security in Healthcare Organizations',
    excerpt: 'Creating a security-focused culture is essential for protecting patient data in modern healthcare settings.',
    content: 'Full article content here...',
    author: 'Maria Garcia, Healthcare Security Consultant',
    date: '2023-03-01',
    readTime: '10 min read',
    category: 'Compliance',
    image: "https://community.trustcloud.ai/kbuPFACeFReXReB/uploads/2024/04/HIPAA-compliance-2.jpg",
    tags: ['Security Culture', 'Training', 'Organization'],
  },
  {
    id: 12,
    title: 'Blockchain Applications in Clinical Trials',
    excerpt: 'Blockchain technology is opening new possibilities for managing and conducting clinical trials.',
    content: 'Full article content here...',
    author: 'Dr. Thomas Wright',
    date: '2023-02-22',
    readTime: '9 min read',
    category: 'Technology',
    image: "https://www.q3tech.com/wp-content/uploads/2024/06/How-to-Store-and-Share-Your-Healthcare-Data-with-Blockchain-Technology.edited.jpg",
    tags: ['Blockchain', 'Clinical Trials', 'Research'],
  }
];


  get filteredPosts(): BlogPost[] {
    return this.posts.filter((post) => {
      const matchesSearch =
        this.searchTerm === '' ||
        post.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesCategory = this.category === 'all' || post.category === this.category;

      return matchesSearch && matchesCategory;
    });
  }

  get currentPosts(): BlogPost[] {
    const indexOfLastPost = this.page * this.postsPerPage;
    const indexOfFirstPost = indexOfLastPost - this.postsPerPage;
    return this.filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  }

  get featuredPost(): BlogPost | undefined {
    return this.posts[0];
  }

  ngOnInit(): void {
    this.fetchPosts();
    const saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');
    this.savedArticles = saved;
  }

  async fetchPosts(): Promise<void> {
    this.loading = true;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    this.posts = this.blogData;
    this.loading = false;
  }

  onSearchChange(): void {
    this.page = 1;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
  }

  onCategoryChange(event: { index: number }): void {
    this.category = this.categories[event.index];
    this.page = 1;
  }

  getTabLabel(category: string): string {
    return category === 'all' ? 'All Categories' : category;
  }

  handlePageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleSaveArticle(id: number): void {
    const isSaved = this.savedArticles.includes(id);
    let newSavedArticles: number[];

    if (isSaved) {
      newSavedArticles = this.savedArticles.filter((articleId) => articleId !== id);
    } else {
      newSavedArticles = [...this.savedArticles, id];
    }

    this.savedArticles = newSavedArticles;
    localStorage.setItem('savedArticles', JSON.stringify(newSavedArticles));
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.category = 'all';
    this.selectedTabIndex = 0;
  }
}